import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { createRef, useEffect, useState } from 'react';
import { readRemoteFile } from 'react-papaparse';
import moment from 'moment';
import './index.css';
import { useNavigate } from 'react-router-dom'
import { Button, Dropdown, Form, Input, Label, Grid, Table, Header, Icon, Segment, Menu } from 'semantic-ui-react'
import { TableBody } from './TableBody';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjects, storeProjects } from '../../store/projectsSlice';
import { useFirebase } from '../../firebase';
import { Header as AppHeader } from '../../components/Header'
import { getSecondsFromTimeHHMM, getTimeFromSecondsHHMM, getWeeksInRange, getWeeksInRangeV2 } from '../../utils/functions';
import { selectCSVFile, selectInvoiceData, setWeekInvoiceData, setSelectedFile } from '../../store/invoiceSlice';

const Home = () => {

	const navigate = useNavigate()

	useEffect(() => {
		const authAccess = localStorage.getItem('authAccess')
		if (!authAccess) {
			navigate('/login')
		}
	}, [])


	const { getTestData, getProjectsList, getInvoiceAppInfo } = useFirebase()
	const projects = useSelector(selectProjects)
	const weekInvoiceData = useSelector(selectInvoiceData)
	const selectedFile = useSelector(selectCSVFile)
	const documentRef = createRef();
	const [from, setFrom] = useState(`Teronext Consulting
A3 Alsa Woodbine Line Road
Thycaud Trivandrum
Kerala India


Ph: +91 7907 881 319
Payment method - via Remote.com`)
	const [to, setTo] = useState('')
	// const [selectedFile, setSelectedFile] = useState();
	const [data, setData] = useState([]);
	// const [projects, setProjects] = useState({});
	const [project, setProject] = useState(Object.keys(projects)[0] || '');
	const [balance, setBalance] = useState(0)
	const [nextMonthEstimate, setNextMonthEstimate] = useState(0)
	const [minDate, setMinDate] = useState();
	const [activeItem, setActiveItem] = useState('Week1')
	const [maxDate, setMaxDate] = useState();
	const [invoiceData, setInvoiceData] = useState([]);
	const [invoiceMode, setInvoiceMode] = useState('week')
	const [invoiceNumber, setInvoiceNumber] = useState(0)
	const [total, setTotal] = useState({
		hoursWorked: '00:00',
		hoursBilled: '00:00',
		usd: 0
	})
	const dispatch = useDispatch()
	const [dateRange, setDateRange] = useState([new Date(), new Date()]);
	useEffect(() => {
		getTestData().then(r => console.log({ r: r.val() }))
	}, [])

	const handleItemClick = (e, { name }) => setActiveItem(name)
	useEffect(() => {
		getProjectsList().then(r => {
			const projects = r.docs.reduce((_projects, doc) => ({
				..._projects,
				[doc.id]: doc.data(),
			}), {})
			console.log(projects);
			dispatch(storeProjects(projects))
			setProject(Object.keys(projects)[0] || '')
		})
	}, [])

	useEffect(() => {
		getInvoiceAppInfo().then(docSnap => {
			if (docSnap.exists()) {
				console.log("Document data:", docSnap.data());
				setInvoiceNumber(Number(docSnap
					.data().last_invoice_number) + 1)
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
		})
	}, [])
	const onChangeHoursWorked = (key, time) => {
		const splittedTime = time.split(':');
		const billedMinutes = moment.utc((parseInt(splittedTime[1] / 10) * 10) * 60000).format('mm');
		const hoursBilled = splittedTime[0] + ':' + billedMinutes
		const hours = Number(splittedTime[0]) + Number(billedMinutes) / 60;
		const totalInUSD = hours * weekInvoiceData[activeItem].data[key].hourlyRate;
		const updatedInvoiceData = {
			...weekInvoiceData[activeItem].data,
			[key]: {
				...weekInvoiceData[activeItem].data[key],
				hoursWorked: time,
				hoursBilled,
				hours,
				totalInUSD
			}
		}
		const total = getTotal(updatedInvoiceData);
		const updatedWeekInvoiceData = {
			...weekInvoiceData,
			[activeItem]: {
				...weekInvoiceData[activeItem],
				data: updatedInvoiceData,
				total,
			}
		}
		console.log({ updatedWeekInvoiceData })
		findAndSaveTotalInvoiceData(updatedWeekInvoiceData)
	}
	const setHourlyRate = (key, rate) => {
		const updatedWeekInvoiceData = Object.keys(weekInvoiceData).reduce((_updatedWeekInvoiceData, weekKey) => {
			const updatedInvoiceData = {
				...weekInvoiceData[weekKey].data,
				[key]: {
					...weekInvoiceData[weekKey].data[key],
					hourlyRate: rate,
					totalInUSD: rate * weekInvoiceData[weekKey].data[key].hours
				}
			}
			const total = getTotal(updatedInvoiceData)
			return {
				..._updatedWeekInvoiceData,
				[weekKey]: {
					...weekInvoiceData[weekKey],
					data: updatedInvoiceData,
					total,
				}
			}
		}, {})

		console.log({ updatedWeekInvoiceData })
		dispatch(setWeekInvoiceData(updatedWeekInvoiceData))
	}
	const getTime = (seconds) => {
		const hoursFromSeconds = parseInt(seconds / 3600)
		const minutesFromSecond = moment.utc(parseInt((seconds - hoursFromSeconds * 3600)) * 1000).format('mm')
		const time = hoursFromSeconds + ':' + minutesFromSecond;
		return time
	}
	const zeroPad = (num, size) => {
		var s = String(num);
		while (s.length < (size || 2)) { s = "0" + s; }
		return s;
	}
	const getSeconds = (time) => {
		const timeArray = time.split(':');
		const secondsFromHours = Number(timeArray[0]) * 3600;
		const secondsFromMinutes = Number(timeArray[1]) * 60;
		const timeInSeconds = secondsFromHours + secondsFromMinutes;
		return timeInSeconds;
	}
	const findTotal = (invoiceData) => {
		const hoursWorkedArray = Object.values(invoiceData).map(item => item.hoursWorked);
		console.log({ hoursWorkedArray })
		const totalHoursWorked = hoursWorkedArray.reduce((total, hoursWorked) => {
			const totalInSeconds = getSeconds(total)
			const hoursWorkedInSeconds = getSeconds(hoursWorked);
			const newTotalInSeconds = totalInSeconds + hoursWorkedInSeconds;
			const newTotal = getTime(newTotalInSeconds)
			return newTotal
		}, '00:00')
		console.log({ totalHoursWorked })
		const hoursBilledArray = Object.values(invoiceData).map(item => item.hoursBilled);
		console.log({ hoursBilledArray })
		const totalHoursBilled = hoursBilledArray.reduce((total, hoursBilled) => {
			const totalInSeconds = getSeconds(total)
			const hoursWorkedInSeconds = getSeconds(hoursBilled);
			const newTotalInSeconds = totalInSeconds + hoursWorkedInSeconds;
			const newTotal = getTime(newTotalInSeconds)
			return newTotal
		}, '00:00')
		console.log({ totalHoursBilled })
		const totalInUSDArray = Object.values(invoiceData).map(item => item.totalInUSD);
		console.log({ totalInUSDArray })
		const totalInUSD = totalInUSDArray.reduce((total, usd) => total + Number(usd), 0)
		console.log({ totalInUSDArray, totalInUSD })
		setTotal({
			hoursWorked: totalHoursWorked,
			hoursBilled: totalHoursBilled,
			usd: totalInUSD
		})
	}
	const getTotal = (invoiceData) => {
		const hoursWorkedArray = Object.values(invoiceData).map(item => item.hoursWorked);
		console.log({ hoursWorkedArray })
		const totalHoursWorked = hoursWorkedArray.reduce((total, hoursWorked) => {
			const totalInSeconds = getSeconds(total)
			const hoursWorkedInSeconds = getSeconds(hoursWorked);
			const newTotalInSeconds = totalInSeconds + hoursWorkedInSeconds;
			const newTotal = getTime(newTotalInSeconds)
			return newTotal
		}, '00:00')
		console.log({ totalHoursWorked })
		const hoursBilledArray = Object.values(invoiceData).map(item => item.hoursBilled);
		console.log({ hoursBilledArray })
		const totalHoursBilled = hoursBilledArray.reduce((total, hoursBilled) => {
			const totalInSeconds = getSeconds(total)
			const hoursWorkedInSeconds = getSeconds(hoursBilled);
			const newTotalInSeconds = totalInSeconds + hoursWorkedInSeconds;
			const newTotal = getTime(newTotalInSeconds)
			return newTotal
		}, '00:00')
		console.log({ totalHoursBilled })
		const totalInUSDArray = Object.values(invoiceData).map(item => item.totalInUSD);
		console.log({ totalInUSDArray })
		const totalInUSD = totalInUSDArray.reduce((total, usd) => total + Number(usd), 0)
		console.log({ totalInUSDArray, totalInUSD })
		return ({
			hoursWorked: totalHoursWorked,
			hoursBilled: totalHoursBilled,
			usd: totalInUSD
		})
	}
	const getInvoiceData = (start, end) => {
		const dataInRange = data.filter(item => {
			const startTime = new Date(item.start_time);
			const isInRange = moment(startTime).isBetween(moment(start).startOf('day'), moment(end).endOf('day'));
			return isInRange
		})
		const workers = dataInRange.reduce((_workers, item) => {
			const formattedKey = (item.workers || '').toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
			if (Object.keys(_workers).includes(formattedKey)) {
				return {
					..._workers,
					[formattedKey]: [
						..._workers[formattedKey],
						item
					]

				}
			} else {
				return {
					..._workers,
					[formattedKey]: [item]
				}
			}
		}, {})
		const invoiceData = Object.keys(workers).reduce((_invoiceData, key) => {
			const workersData = workers[key];
			const worker = key;
			console.log({
				[key]: workersData
			})
			const totalDurationInseconds = workersData.reduce((total, item) => total + (parseInt(item.duration_seconds)), 0)
			const hoursFromSeconds = parseInt(Number(totalDurationInseconds) / 3600)
			const minutesFromSecond = moment.utc(parseInt((totalDurationInseconds - hoursFromSeconds * 3600)) * 1000).format('mm')
			const hoursWorked = hoursFromSeconds + ':' + minutesFromSecond
			const flooredMinutes = parseInt(minutesFromSecond / 10) * 10;
			const hoursBilled = hoursFromSeconds + ':' + moment.utc(flooredMinutes * 60000).format('mm');
			const splittedTime = hoursBilled.split(':');
			const hours = (hoursFromSeconds + flooredMinutes / 60);
			return {
				..._invoiceData,
				[key]: {
					worker,
					timeWorked: totalDurationInseconds,
					hoursWorked,
					hoursBilled,
					hours,
					hourlyRate: 1,
					totalInUSD: hours,
				}
			}
		}, {})
		const total = getTotal(invoiceData)
		return ({
			data: invoiceData,
			total,
			start,
			end,
		})
	}

	const findAndSaveTotalInvoiceData = (weekInvoiceData) => {
		const invoiceMerged = Object.keys(weekInvoiceData).filter(item => item !== 'Total').reduce((_invoiceMerged, key) => {
			const invoice = weekInvoiceData[key];
			return [
				..._invoiceMerged,
				...Object.keys(invoice.data).map((key) => invoice.data[key])
			]
		}, [])

		const invoiceByWorkers = invoiceMerged.reduce((_invoiceByWorkers, item) => {

			if (Object.keys(_invoiceByWorkers).includes(item.worker)) {
				return {
					..._invoiceByWorkers,
					[item.worker]: [
						..._invoiceByWorkers[item.worker],
						item.hoursBilled
					]

				}
			} else {
				return {
					..._invoiceByWorkers,
					[item.worker]: [item.hoursBilled]
				}
			}
		}, {})
		const totalInvoice = Object.keys(invoiceByWorkers).reduce((_totalInvoice, key) => {
			const hoursWorkedArray = invoiceByWorkers[key];
			const totalSeconds = hoursWorkedArray.reduce((total, time) => {
				const seconds = getSecondsFromTimeHHMM(time)
				return total + seconds
			}, 0)
			const hoursWorked = getTimeFromSecondsHHMM(totalSeconds)
			const splittedTime = hoursWorked.split(':');
			// const billedMinutes = parseInt(splittedTime[1] / 10) * 10;
			const billedMinutes = moment.utc((parseInt(splittedTime[1] / 10) * 10) * 60000).format('mm');
			const hoursBilled = splittedTime[0] + ':' + billedMinutes
			const hours = Number(splittedTime[0]) + Number(billedMinutes) / 60;
			const totalInUSD = hours * 1;
			const updatedInvoiceData = {
				..._totalInvoice,
				[key]: {
					worker: key,
					timeWorked: totalSeconds,
					hoursWorked,
					hoursBilled,
					hours,
					totalInUSD,
					hourlyRate: 1,
				}
			}
			return updatedInvoiceData
		}, {})
		const total = getTotal(totalInvoice)
		dispatch(setWeekInvoiceData({
			...weekInvoiceData,
			Total: {
				data: totalInvoice,
				total,
				start: minDate,
				end: maxDate,
			}
		}))
	}

	useEffect(() => {
		const weeks = getWeeksInRange(new Date(dateRange[0]), new Date(dateRange[1]), 1)
		const weeks2 = getWeeksInRangeV2(new Date(dateRange[0]), new Date(dateRange[1]), 1)
		const weeksInvoice = weeks2.reduce((_weeksInvoice, week, index) => {
			return {
				..._weeksInvoice,
				['Week' + (index + 1)]: getInvoiceData(week.start, week.end)
			}
		}, {})

		dispatch(setWeekInvoiceData(weeksInvoice))
		console.log({ weeks, weeks2, weeksInvoice })

		findAndSaveTotalInvoiceData(weeksInvoice)

	}, [dateRange])
	const onChangeDateRange = (range) => {
		setDateRange(range)
	}

	useEffect(() => {
		if (selectedFile) {
			const url = URL.createObjectURL(selectedFile)
			readRemoteFile(url, {
				header: true,
				skipEmptyLines: true,
				complete: ({ data }) => {
					console.log(data)
					setData(data)
					const dates = data.map(item => moment(item.start_time))
					console.log(dates)
					setMinDate(moment.min(dates).startOf('day').toDate())
					setMaxDate(moment.max(dates).endOf('day').toDate())
					setDateRange([moment.min(dates).startOf('day').toDate(), moment.max(dates).endOf('day').toDate()])
				}
			})
		}
	}, [selectedFile])

	useEffect(() => {
		if (project && projects[project]) {
			if (invoiceMode === 'week') {
				setTo(projects[project].weekly_invoice_address)
				setBalance(projects[project].week_balance)
				setActiveItem('Week1')
			} else if (invoiceMode === 'month') {
				setTo(projects[project].monthly_invoice_address)
				setBalance(projects[project].month_balance)
				setActiveItem('Total')
			}
		}
	}, [invoiceMode, project])

	return (
		<>
			<AppHeader />
			<div className="home-container">
				<Grid>
					<Grid.Column mobile={16} tablet={5} computer={5}>
						<Form>
							<Form.Field>
								<label>Dates</label>
								<div id='date-range-picker'>
									<DateRangePicker
										// minDate={minDate}
										// maxDate={maxDate}
										onChange={onChangeDateRange}
										value={dateRange}
									/>
								</div>
							</Form.Field>
							<Form.Field>
								<label>Invoice Number</label>
								<Input labelPosition='left' type='text' placeholder='Amount'>
									<Label basic>#</Label>
									<input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
								</Input>
							</Form.Field>
							{/* <Form.Field>
							<label>Date</label>
							<input />
						</Form.Field> */}
							<Form.Field>
								<label>Project</label>
								<Dropdown value={project} placeholder='Project' search selection
									onChange={(e, data) => {
										setProject(data.value)
									}}
									options={Object.keys(projects).map(key => ({
										key,
										value: key,
										text: projects[key].name

									}))} />
							</Form.Field>
							<Form.Field>
								<label>Invoice Mode</label>
								<Dropdown value={invoiceMode} placeholder='Select invoice mode' selection
									onChange={(e, data) => {
										setInvoiceMode(data.value)
									}}
									options={[
										{
											key: 'week',
											value: 'week',
											text: 'Week'
										},
										{
											key: 'month',
											value: 'month',
											text: 'Month'
										},
									]} />
							</Form.Field>
							{
								invoiceMode === 'week' && (
									<Form.Field>
										<label>Select Week</label>
										<Dropdown value={activeItem} placeholder='Select week' selection
											onChange={(e, data) => {
												setActiveItem(data.value)
											}}
											options={Object.keys(weekInvoiceData).filter(key => key !== 'Total').map(key => ({
												key,
												value: key,
												text: `${key}: ${moment(weekInvoiceData[key].start).format('DD/MM/YY')} - ${moment(weekInvoiceData[key].end).format('DD/MM/YY')}`,
											}))} />
									</Form.Field>
								)
							}
							<Form.Field>
								<label>{`Starting ${invoiceMode === 'week' ? 'week' : 'monthly'} balance`}</label>
								<Input labelPosition='left' type='text' placeholder='Amount'>
									<Label basic>$</Label>
									<input value={balance} onChange={(e) => setBalance(e.target.value)} />
								</Input>
							</Form.Field>
							<Form.Field>
								<label>{`Ending ${invoiceMode === 'week' ? 'week' : 'monthly'} balance`}</label>
								<Input labelPosition='left' type='text' placeholder='Amount'>
									<Label basic>$</Label>
									<input value={(Number(balance) - Number(
										invoiceMode === 'month'
											? weekInvoiceData.Total?.total?.usd.toFixed(2)
											: weekInvoiceData[activeItem]?.total?.usd.toFixed(2)
									)).toFixed(2)} readOnly onChange={(e) => { }} />
								</Input>
							</Form.Field>
							{
								invoiceMode === 'month' && (
									<Form.Field>
										<label>Total estimate for the month of {moment(dateRange[0]).add(1, 'month').format('MMMM')}</label>
										<Input labelPosition='left' type='text' placeholder='Amount'>
											<Label basic>$</Label>
											<input value={nextMonthEstimate} onChange={(e) => { setNextMonthEstimate(e.target.value) }} />
										</Input>
									</Form.Field>
								)
							}
							<Form.TextArea label='From' placeholder='From Address...' value={from} onChange={(e) => setFrom(e.target.value)} />
							<Form.TextArea label='To' placeholder='To Address...' onChange={(e) => setTo(e.target.value)} value={to} />
						</Form>
					</Grid.Column>
					<Grid.Column mobile={16} tablet={11} computer={11}>
						<input hidden onChange={(e) => {
							if (e.target.files.length > 0) {
								dispatch(setSelectedFile(e.target.files[0]))
							}
							console.log(e.target.files[0])
						}} accept='.csv' ref={documentRef} type='file' />
						{!selectedFile ? (
							<div className='csv-selector'>
								<Segment placeholder>
									<Header icon>
										<Icon name='excel file outline' />
										{selectedFile?.name || 'No document selected.'}
									</Header>
									<Button onClick={() => documentRef.current.click()} primary> {!selectedFile ? 'Add Document' : 'Change Document'}</Button>
								</Segment>
							</div>
						) : (
								<div style={{ marginBottom: 20 }}>
									<Button as='div' labelPosition='left'>
										<Label as='a' basic pointing='right'>
											{selectedFile.name}
										</Label>
										<Button onClick={() => documentRef.current.click()} icon>
											Change
									</Button>
									</Button>
								</div>
							)}
						{
							selectedFile && weekInvoiceData && Object.keys(weekInvoiceData).length > 0 && (
								<div>
									{
										invoiceMode === 'month' && (
											<Menu color='blue' secondary className='menu'>
												{((Object.keys(weekInvoiceData) || []).map((key, index) => {
													return (
														<Menu.Item
															name={key}
															active={activeItem === key}
															children={key}
															onClick={handleItemClick}
														/>
													)
												}))}
											</Menu>
										)
									}
									<Segment>
										<Header as='h5'>
											{`Invoice #${zeroPad(Number(invoiceNumber), 4)}`}
										</Header>
										<Header as='h5'>
											Period: {moment(weekInvoiceData[activeItem]?.start).format('MMMM D ,YYYY ')} through {moment(weekInvoiceData[activeItem]?.end).format('MMMM D ,YYYY ')}
										</Header>
										<Table celled striped>
											<Table.Header>
												<Table.Row>
													<Table.HeaderCell>#</Table.HeaderCell>
													<Table.HeaderCell>Worker</Table.HeaderCell>
													{activeItem !== 'Total' && <Table.HeaderCell>Hours Worked</Table.HeaderCell>}
													<Table.HeaderCell>Hours Billed</Table.HeaderCell>
													<Table.HeaderCell>Hourly Rate</Table.HeaderCell>
													<Table.HeaderCell>Total in USD</Table.HeaderCell>
												</Table.Row>
											</Table.Header>
											<TableBody
												activeItem={activeItem}
												onChangeHoursWorked={onChangeHoursWorked} data={data}
												total={weekInvoiceData[activeItem]?.total || {}}
												invoiceData={weekInvoiceData[activeItem]?.data || {}}
												setHourlyRate={setHourlyRate}
											/>
										</Table>
									</Segment>
								</div>
							)
						}
						<br />
						<br />
						<Button onClick={() => {
							navigate('/week_invoice', {
								state: {
									nextMonthEstimate,
									invoiceMode,
									invoiceData: (invoiceMode === 'month') ? (weekInvoiceData?.Total?.data || {}) : (weekInvoiceData[activeItem]?.data || {}),
									from,
									to,
									dates: [weekInvoiceData[activeItem]?.start, weekInvoiceData[activeItem]?.end],
									startBalance: balance,
									endBalance: (Number(balance) - Number(
										invoiceMode === 'month'
											? weekInvoiceData.Total?.total?.usd.toFixed(2)
											: weekInvoiceData[activeItem]?.total?.usd.toFixed(2)
									)).toFixed(2),
									invoiceNumber: zeroPad(Number(invoiceNumber), 4),
									total: (invoiceMode === 'month') ? (weekInvoiceData?.Total?.total || {}) : (weekInvoiceData[activeItem]?.total || {}),
									project: projects[project].name
								}
							});
						}} color='blue' size='medium'>Generate Invoice</Button>
					</Grid.Column>
				</Grid>
			</div>
		</>
	);
}

export { Home }