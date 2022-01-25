import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { createRef, useEffect, useState } from 'react';
import { readRemoteFile } from 'react-papaparse';
import moment from 'moment';
import 'moment-weekday-calc';
import './index.css';
import { useNavigate } from 'react-router-dom'
import { Button, Dropdown, Form, Input, Label, Grid, Table, Header, Icon, Segment, Menu, Accordion } from 'semantic-ui-react'
import { TableBody } from './TableBody';
import { useDispatch, useSelector } from 'react-redux';
import { selectProjects, storeProjects } from '../../store/projectsSlice';
import { useFirebase } from '../../firebase';
import { Header as AppHeader } from '../../components/Header'
import { getSecondsFromTimeHHMM, getTimeFromSecondsHHMM, getWeeksInRange, getWeeksInRangeV2, zeroPad } from '../../utils/functions';
import { selectCSVFile, selectJSONFile, selectInvoiceData, setWeekInvoiceData, setSelectedFile, setSelectedJSONFile, selectCardData, setCardData, selectFormData, setFormData, setAppData } from '../../store/invoiceSlice';
import { render } from 'react-dom';
import axios from 'axios';
import { Version2Client } from 'jira.js';
import JiraApi from 'jira-client';
import { TableHeader } from './TableHeader';
import routes from '../../constants/routes';
import { current } from '@reduxjs/toolkit';


const client = new Version2Client({
	host: 'https://anshad.atlassian.net',
	authentication: {
		basic: {
			email: 'muhammad.anshad@teronext.com',
			password: '9645542515@Teronext'
		},
	},
});

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
	const cardData = useSelector(selectCardData)
	const selectedFile = useSelector(selectCSVFile)
	const selectedJSONFile = useSelector(selectJSONFile)
	const formData = useSelector(selectFormData)

	const documentRef = createRef();
	const jsonRef = createRef();

	const [from, setFrom] = useState('Teronext Consulting\nA3 Alsa Woodbine Line Road\nThycaud Trivandrum\nKerala India\n\n\nPh: +91 7907 881 319\nPayment method - via Remote.com')
	const [to, setTo] = useState('')
	const [data, setData] = useState([]);
	const [project, setProject] = useState(Object.keys(projects)[0] || '');
	const [balance, setBalance] = useState(0)
	const [nextMonthEstimate, setNextMonthEstimate] = useState(0)
	const [minDate, setMinDate] = useState();
	const [activeItem, setActiveItem] = useState('Week1')
	const [maxDate, setMaxDate] = useState();
	const [invoiceMode, setInvoiceMode] = useState('week')
	const [invoiceNumber, setInvoiceNumber] = useState(0)

	// const {
	// 	to,
	// } = formData

	// const setTo = (data) => dispatch(setFormData({to: data}))

	const dispatch = useDispatch()
	const [dateRange, setDateRange] = useState([new Date(), new Date()]);
	const [sprintDateRange, setSprintDateRange] = useState([new Date(), new Date()]);
	const [sprints, setSprints] = useState();

	useEffect(() => {
		// getTestData().then(r => console.log({ r: r.val() }))
	}, [])

	const handleItemClick = (e, { name }) => setActiveItem(name)

	useEffect(() => {
		getProjectsList().then(r => {
			const projects = r.docs.reduce((_projects, doc) => ({
				..._projects,
				[doc.id]: doc.data(),
			}), {})
			dispatch(storeProjects(projects))
			setProject(Object.keys(projects)[0] || '')
		})
	}, [])

	useEffect(() => {
		getInvoiceAppInfo().then(docSnap => {
			if (docSnap.exists()) {
				setInvoiceNumber(Number(docSnap
					.data().last_invoice_number) + 1)
				dispatch(setAppData(docSnap.data()))
			} else {
				// doc.data() will be undefined in this case
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
		findAndSaveTotalInvoiceData(updatedWeekInvoiceData)
	}
	const setHourlyRate = (key, rate) => {
		const updatedWeekInvoiceData = Object.keys(weekInvoiceData).reduce((_updatedWeekInvoiceData, weekKey) => {
			const updatedInvoiceData = {
				...weekInvoiceData[weekKey].data,
				...(!!weekInvoiceData[weekKey]?.data[key] && {
					[key]: {
						...weekInvoiceData[weekKey].data[key],
						hourlyRate: rate,
						totalInUSD: rate * weekInvoiceData[weekKey]?.data[key]?.hours || 0
					}
				})
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

		dispatch(setWeekInvoiceData(updatedWeekInvoiceData))
	}

	const getTotal = (invoiceData) => {
		const hoursWorkedArray = Object.values(invoiceData).map(item => item.hoursWorked);
		const totalHoursWorked = hoursWorkedArray.reduce((total, hoursWorked) => {
			const totalInSeconds = getSecondsFromTimeHHMM(total)
			const hoursWorkedInSeconds = getSecondsFromTimeHHMM(hoursWorked);
			const newTotalInSeconds = totalInSeconds + hoursWorkedInSeconds;
			const newTotal = getTimeFromSecondsHHMM(newTotalInSeconds)
			return newTotal
		}, '00:00')
		const hoursBilledArray = Object.values(invoiceData).map(item => item.hoursBilled);
		const totalHoursBilled = hoursBilledArray.reduce((total, hoursBilled) => {
			const totalInSeconds = getSecondsFromTimeHHMM(total)
			const hoursWorkedInSeconds = getSecondsFromTimeHHMM(hoursBilled);
			const newTotalInSeconds = totalInSeconds + hoursWorkedInSeconds;
			const newTotal = getTimeFromSecondsHHMM(newTotalInSeconds)
			return newTotal
		}, '00:00')
		const totalInUSDArray = Object.values(invoiceData).map(item => item.totalInUSD);
		const totalInUSD = totalInUSDArray.reduce((total, usd) => total + Number(usd), 0)
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
			const totalDurationInseconds = workersData.reduce((total, item) => total + (parseInt(item.duration_seconds)), 0)
			const hoursFromSeconds = parseInt(Number(totalDurationInseconds) / 3600)
			const minutesFromSecond = moment.utc(parseInt((totalDurationInseconds - hoursFromSeconds * 3600)) * 1000).format('mm')
			const hoursWorked = hoursFromSeconds + ':' + minutesFromSecond
			const flooredMinutes = parseInt(minutesFromSecond / 10) * 10;
			const hoursBilled = hoursFromSeconds + ':' + moment.utc(flooredMinutes * 60000).format('mm');
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
			start: start.toISOString(),
			end: end.toISOString(),
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
				start: minDate?.toISOString(),
				end: maxDate?.toISOString(),
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


		const weeks2Sprint = weeks2.reduce((_sprints, week, index) => {

			const start = moment(week.start).day(3).subtract(1, 'weeks').format('YYYY/MM/DD');
			const end = moment(week.start).day(3).format('YYYY/MM/DD');
			if (moment(week.start).weekday() === 0) {
				return {
					..._sprints,
					['Week' + (index + 1)]: {
						start: moment(week.start).subtract(1, 'weeks').day(3).subtract(1, 'weeks').format('YYYY/MM/DD'),
						end: moment(week.start).subtract(1, 'weeks').day(3).format('YYYY/MM/DD')
					}
				}
			}
			if (moment(week.start).weekday() > 3) {
				return {
					..._sprints,
					['Week' + (index + 1)]: {
						start: moment(week.start).day(3).subtract(1, 'weeks').format('YYYY/MM/DD'),
						end: moment(week.start).day(3).format('YYYY/MM/DD')
					}
				}
			}
			if (moment(week.end).weekday() < 3 && moment(week.end).weekday() !== 0  ) {
				return {
					..._sprints,
					['Week' + (index + 1)]: {
						start: moment(week.start).subtract(1, 'weeks').day(3).subtract(1, 'weeks').format('YYYY/MM/DD'),
						end: moment(week.start).subtract(1, 'weeks').day(3).format('YYYY/MM/DD')
					}
				}
			}
			if (moment(week.start).weekday() < 3 && (moment(week.end).weekday() >= 3 || moment(week.end).weekday() === 0)) {
				return {
					..._sprints,
					['Week' + (index + 1)]: {
						start: moment(week.start).day(3).subtract(1, 'weeks').format('YYYY/MM/DD'),
						end: moment(week.start).day(3).format('YYYY/MM/DD')
					}
				}
			}
			// if (moment(end).isSameOrBefore(moment(dateRange[1]).format('YYYY/MM/DD')) ) {
			// 	return {
			// 		..._sprints,
			// 		['Week' + (index + 1)]: {
			// 			start,
			// 			end,
			// 		}
			// 	}
			// }
			return {
				..._sprints,
				['Week' + (index + 1)]: {
					start: null,
					end: null,
				}
			}
		}, {})


		setSprints(weeks2Sprint)

		dispatch(setWeekInvoiceData(weeksInvoice))

		findAndSaveTotalInvoiceData(weeksInvoice)
		// setSprintDateRange([
		// 	moment(dateRange[0]).day(3).subtract(1, 'weeks').format('YYYY/MM/DD'),
		// 	moment(dateRange[0]).day(3).format('YYYY/MM/DD'),
		// ])
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
					setData(data)
					const dates = data.map(item => moment(item.start_time))
					setMinDate(moment.min(dates).startOf('day').toDate())
					setMaxDate(moment.max(dates).endOf('day').toDate())
					setDateRange([moment.min(dates).startOf('day').toDate(), moment.max(dates).endOf('day').toDate()])
				}
			})
		}
	}, [selectedFile])

	// const readJsonFileText = async () => {
	// 	const text = await selectedJSONFile.text()
	// 	return JSON.parse(text)
	// }

	const getCardTotal = (cardData) => Object.values(
		cardData
	).reduce((_result, value, index) => {
		return {
			..._result,
			...Object.keys(value).reduce((_cards, key) => {
				if (Object.keys(_result).includes(key)) {
					const cardTotal = (value[key].total?.cardTotal || 0) + (_result[key].total?.cardTotal || 0);
					const totalDays = {
						asTeamMember: value[key]?.total?.totalDays?.asTeamMember + _result[key]?.total?.totalDays?.asTeamMember,
						asQAPerson: value[key]?.total?.totalDays?.asQAPerson + _result[key]?.total?.totalDays?.asQAPerson
					}
					const average = {
						asTeamMember: (Number(totalDays.asTeamMember) / Number(cardTotal)).toFixed(1),
						asQAPerson: (Number(totalDays.asQAPerson) / Number(cardTotal)).toFixed(1)
						// asTeamMember: ((Number(value[key]?.total?.average?.asTeamMember).toFixed(1) + Number(_result[key]?.total?.average?.asTeamMember).toFixed(1)) / 2).toFixed(1),
						// asQAPerson: ((Number(value[key]?.total?.average?.asQAPerson).toFixed(1) + Number(_result[key]?.total?.average?.asQAPerson).toFixed(1)) / 2).toFixed(1)
					}
					return {
						..._cards,
						[key]: {
							cards: [...(_result[key]?.cards || []), ...(value[key]?.cards || [])],
							role: value[key].role,
							total: {
								cardTotal,
								totalDays,
								average
							}
						}
					}
				} else {
					return {
						..._cards,
						[key]: value[key]
					}
				}
			}, {})
		}
	}, {})

	useEffect(() => {
		if (selectedJSONFile && selectedJSONFile[activeItem]) {
			selectedJSONFile[activeItem]?.text()?.then(text => {
				const jsonData = JSON.parse(text)
				const jsonDataByAssignee = jsonData
				const cardDataTemp = Object.keys(jsonDataByAssignee).reduce((_cardData, key) => {
					const assignedIssues = jsonDataByAssignee[key]|| [];
					const assignedIssuesFiltered = assignedIssues.filter(item => !!item);
					const cards = assignedIssuesFiltered.map(item => {
						const cardName = item.key;
						const histories = item.changelog.histories;
						const getDate = (status) => {

							let index = 0;
							let date = histories.find(item => item.items[0].toString.toUpperCase() === status[index])?.created;
							while (!!!date && index + 1 < status.length) {
								index = index + 1
								date = histories.find(item => item.items[0].toString.toUpperCase() === status[index])?.created;
							}
							return date
						}
						let todoDate = histories.find(item => (item.items[0].toString.toUpperCase() === 'IN PROGRESS' || item.items[0].field === 'Parent' || item.items[0].field === 'assignee'))?.created;

						const actualToDoDate = todoDate;

						if (sprints && sprints[activeItem] && moment(todoDate).isBefore(sprints[activeItem].start)) {
							todoDate = sprints[activeItem].start
						} else if (sprints && sprints[activeItem] && moment(todoDate).isAfter(sprints[activeItem].end)) {
							todoDate = sprints[activeItem].end
						}
						// const inQADate = histories.find(item => item.items[0].toString.toUpperCase() === 'IN PEER REVIEW' || item.items[0].toString.toUpperCase() === 'NEEDS QA' || item.items[0].toString.toUpperCase() === 'IN QA' || item.items[0].toString.toUpperCase() === 'DONE')?.created;
						let inPeerReview = getDate([
							'IN PEER REVIEW',
							'NEEDS QA',
							'IN QA',
							'IN DEV',
							'DONE'
						]);
						const actualInPeerReview = inPeerReview
						if (!inPeerReview || moment(moment(inPeerReview).format('YYYY/MM/DD')).isBefore(moment(todoDate).format('YYYY/MM/DD'))) {
							inPeerReview = todoDate
						}
						if (sprints && sprints[activeItem] && moment(inPeerReview).isBefore(sprints[activeItem].start)) {
							inPeerReview = sprints[activeItem].start
						} else if (sprints && sprints[activeItem] && moment(inPeerReview).isAfter(sprints[activeItem].end)) {
							inPeerReview = sprints[activeItem].end
						}

						let inQADate = getDate([
							'IN QA',
							'QA PASSED',
							'READY FOR STAGING',
							'IN STAGING',
							'IN DEV',
							'DONE'
						]);
						const actualInQADate = inQADate
						if (!inQADate || moment(moment(inQADate).format('YYYY/MM/DD')).isBefore(moment(inPeerReview).format('YYYY/MM/DD'))) {
							inQADate = inPeerReview
						}
						if (sprints && sprints[activeItem] && moment(inQADate).isBefore(sprints[activeItem].start)) {
							inQADate = sprints[activeItem].start
						} else if (sprints && sprints[activeItem] && moment(inQADate).isAfter(sprints[activeItem].end)) {
							inQADate = sprints[activeItem].end
						}
						// const inStagingDate = histories.find(item => item.items[0].toString.toUpperCase() === 'QA PASSED' || item.items[0].toString.toUpperCase() === 'IN STAGING' || item.items[0].toString.toUpperCase() === 'READY FOR STAGING' || item.items[0].toString.toUpperCase() === 'DONE')?.created;
						let inStagingDate = getDate([
							'QA PASSED',
							'READY FOR STAGING',
							'IN STAGING',
							'IN DEV',
							'DONE'
						])
						const actualInStagingDate = inStagingDate
						if (!inStagingDate) {
							inStagingDate = inQADate
						}
						if (sprints && sprints[activeItem] && moment(inStagingDate).isBefore(sprints[activeItem].start)) {
							inStagingDate = sprints[activeItem].start
						} else if (sprints && sprints[activeItem] && moment(inStagingDate).isAfter(sprints[activeItem].end) ) {
							inStagingDate = sprints[activeItem].end
						}


						const noOfDaysWorkedAsTeamMember = moment()?.isoWeekdayCalc({
							rangeStart: todoDate,
							rangeEnd: inPeerReview,
							weekdays: [1, 2, 3, 4, 5], //weekdays Mon to Fri
						})
						const noOfDaysWorkedAsQAPerson =  moment()?.isoWeekdayCalc({
							rangeStart: inQADate,
							rangeEnd: inStagingDate,
							weekdays: [1, 2, 3, 4, 5], //weekdays Mon to Fri
						})
						return {cardName, todoDate, inPeerReview, inQADate, inStagingDate, noOfDaysWorkedAsQAPerson, noOfDaysWorkedAsTeamMember, actualInPeerReview, actualInQADate, actualInStagingDate, actualToDoDate}
					})
					const cardTotal = cards.length

					const totalDays = cards.reduce((_totalDays, card) => ({
						asTeamMember: _totalDays.asTeamMember + card.noOfDaysWorkedAsTeamMember,
						asQAPerson: _totalDays.asQAPerson + card.noOfDaysWorkedAsQAPerson,
					}), { asTeamMember: 0, asQAPerson: 0 })

					const average = {
						asTeamMember: (Number(totalDays.asTeamMember) / Number(cardTotal)).toFixed(1),
						asQAPerson: (Number(totalDays.asQAPerson) / Number(cardTotal)).toFixed(1)
					}
					const role = 'Team Member';
					return {
						..._cardData,
						[key]: {
							cards,
							role,
							total: {
								cardTotal,
								totalDays,
								average,
							}
						}
					}
				}, {})

				const updatedCardData = {
					...cardData,
					[activeItem]: cardDataTemp
				}
				delete updatedCardData.Total

				const cardsTotal = getCardTotal(updatedCardData)

				// const Total = Object.keys(cardDataTemp).filter(key => key !== Total).reduce((_total, key, index) => {
				// 	const cardDataSingleWeek = cardDataTemp[key]

				// }, {})
				dispatch(setCardData(
					{
						...updatedCardData,
						Total: cardsTotal,
					}
				))
			})
		}
	}, [selectedJSONFile, sprintDateRange])

	useEffect(() => {

	}, [cardData])

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

	const isInvoiceModeMonth = (invoiceMode === 'month')
	const isInvoiceModeWeek = (invoiceMode === 'week')

	const renderGenerateInvoiceButton = () => {
		const invoice = isInvoiceModeMonth ? weekInvoiceData?.Total : weekInvoiceData[activeItem];
		const invoiceData = invoice?.data || {}
		const total = invoice?.total || {}
		const zeroPaddedInvoiceNumber = zeroPad(Number(invoiceNumber), 4)
		const projectName = projects[project]?.name
		const endBalance = (Number(balance) - Number(total?.usd?.toFixed(2)))?.toFixed(2)
		const dates = [invoice?.start, invoice?.end]
		const state = {
			nextMonthEstimate,
			invoiceMode,
			invoiceData,
			from,
			to,
			dates,
			startBalance: balance,
			endBalance,
			invoiceNumber: zeroPaddedInvoiceNumber,
			total,
			project: {
				name: projectName,
				key: project,
			},
			cardData: cardData[activeItem],
		}

		// const navigateToInvoice = () => navigate('/week_invoice', {
		// 	state
		// });
		const navigateToInvoice = () => navigate(routes.INVOICE, {
			state
		});

		return selectedFile && (
			// <Button onClick={navigateToInvoice} color='blue' size='medium'>Generate Invoice</Button>
			<Button onClick={navigateToInvoice} color='blue' size='medium'>Generate Invoice</Button>
		)
	}

	const renderDownloadInvoiceButton = () => {
		const invoice = isInvoiceModeMonth ? weekInvoiceData?.Total : weekInvoiceData[activeItem];
		const invoiceData = invoice?.data || {}
		const total = invoice?.total || {}
		const zeroPaddedInvoiceNumber = zeroPad(Number(invoiceNumber), 4)
		const projectName = projects[project]?.name
		const endBalance = (Number(balance) - Number(total?.usd?.toFixed(2)))?.toFixed(2)
		const dates = [invoice?.start, invoice?.end]
		const state = {
			nextMonthEstimate,
			invoiceMode,
			invoiceData,
			from,
			to,
			dates,
			startBalance: balance,
			endBalance,
			invoiceNumber: zeroPaddedInvoiceNumber,
			total,
			project: projectName,
			cardData: cardData[activeItem],
		}

		const navigateToInvoice = () => navigate('/download_invoice', {
			state
		});

		return selectedFile && (
			<Button onClick={navigateToInvoice} color='blue' size='medium'>Download Invoice</Button>
		)
	}

	const renderTableSegment = () => {
		const header = `Invoice #${zeroPad(Number(invoiceNumber), 4)}`;
		const period = `${moment(weekInvoiceData[activeItem]?.start).format('MMMM D ,YYYY ')} through ${moment(weekInvoiceData[activeItem]?.end).format('MMMM D ,YYYY ')}`
		const total = weekInvoiceData[activeItem]?.total || {}
		const invoiceData = weekInvoiceData[activeItem]?.data || {}
		return (
			<Segment>
				<Header as='h5'>
					{header}
				</Header>
				<Header as='h5'>
					Period: {period}
				</Header>
				<Table celled striped>
					<TableHeader activeItem={activeItem} />
					<TableBody
						activeItem={activeItem}
						onChangeHoursWorked={onChangeHoursWorked}
						data={data}
						total={total}
						invoiceData={invoiceData}
						setHourlyRate={setHourlyRate}
						cardData={cardData[activeItem]}
					/>
				</Table>
			</Segment>
		)
	}

	const onClickFileInput = () => documentRef.current.click()
	const onClickJSONFileInput = () => jsonRef.current.click()

	const renderFileInput = () => {
		if (selectedFile) {
			return (
				<div style={{ marginBottom: 20 }}>
					<Button as='div' labelPosition='left'>
						<Label as='a' basic pointing='right'>
							{selectedFile.name}
						</Label>
						<Button onClick={onClickFileInput} icon>
							Change
									</Button>
					</Button>
				</div>
			)
		}
		const buttonText = !selectedFile ? 'Add a .csv file' : 'Change document';
		const content = selectedFile?.name || 'Upload TopTracker Report';
		return (
			<div className='csv-selector'>
				<Segment placeholder>
					<Header icon>
						<Icon name='file alternate outline' />
						{content}
					</Header>
					<Button onClick={onClickFileInput} primary> {buttonText}</Button>
				</Segment>
			</div>
		)
	}

	const onDeleteJSONFile = () => {
		const tempCardData = { ...cardData };
		delete tempCardData[activeItem];
		delete tempCardData.Total;
		const tempSelectedJSONFile = { ...selectedJSONFile };
		delete tempSelectedJSONFile[activeItem];
		dispatch(setSelectedJSONFile(tempSelectedJSONFile))


		const cardsTotal = getCardTotal(tempCardData)
		dispatch(setCardData(
			{
				...tempCardData,
				Total: cardsTotal,
			}
		))
	}

	const renderJSONFileInput = () => {
		if (activeItem !== 'Total') {
			if (selectedJSONFile && selectedJSONFile[activeItem]) {
				return (
					<div style={{ marginBottom: 20, width: '100%', display: 'flex', justifyContent: 'space-between' }}>
						<Button as='div' labelPosition='left'>
							<Label as='a' basic pointing='right'>
								{selectedJSONFile[activeItem].name}
							</Label>
							<Button positive onClick={onClickJSONFileInput} icon>
								Change
						</Button>
						</Button>
						<Button negative onClick={onDeleteJSONFile} icon>
							Remove
					</Button>
					</div>
				)
			}
			const buttonText = !selectedJSONFile || !selectedJSONFile[activeItem] ? 'Add a .json file' : 'Change .json file';
			const content = !selectedJSONFile || selectedJSONFile[activeItem]?.name || 'Upload Jira data';
			return (
				<div className='csv-selector'>
					<Segment placeholder>
						<Header icon>
							<Icon name='file code outline' />
							{content}
						</Header>
						<Button onClick={onClickJSONFileInput} primary> {buttonText}</Button>
					</Segment>
				</div>
			)
		}
	}

	const renderWeeksTabsMenu = () => isInvoiceModeMonth && (
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

	const hasWeekInvoice = (Object.keys(weekInvoiceData).length > 0)
	const showTabsAndTable = (selectedFile && weekInvoiceData && hasWeekInvoice)
	const renderInvoiceTabsAndTable = () => showTabsAndTable && (
		<div>
			{renderWeeksTabsMenu()}
			{renderTableSegment()}
		</div>
	)

	const onChangeFile = (e) => {
		if (e.target.files.length > 0) {
			dispatch(setSelectedFile(e.target.files[0]));
			jsonRef.current.value = "";
		}
	}
	const onChangeJSONFile = (e) => {
		if (e.target.files.length > 0) {
			dispatch(setSelectedJSONFile({
				...selectedJSONFile,
				[activeItem]: e.target.files[0]
			}))
			jsonRef.current.value = '';
		}
	}

	const renderHiddenFileInput = () => (
		<input hidden onChange={onChangeFile} accept='.csv' ref={documentRef} type='file' />
	)

	const renderHiddenJSONFileInput = () => (
		<input hidden onChange={onChangeJSONFile} accept='.json' ref={jsonRef} type='file' />
	)

	const renderSelectWeekDropdown = () => {
		const onChangeActiveItem = (e, data) => setActiveItem(data.value)
		const weekKeys = Object.keys(weekInvoiceData)
		const weekOptions = weekKeys.filter(key => key !== 'Total').map(key => {
			const startDate = moment(weekInvoiceData[key].start).format('DD/MM/YY')
			const endDate = moment(weekInvoiceData[key].end).format('DD/MM/YY')
			const text = `${key}: ${startDate} - ${endDate}`
			return ({
				key,
				value: key,
				text,
			})
		})
		return isInvoiceModeWeek && (
			<Form.Field>
				<label>Select Week</label>
				<Dropdown
					value={activeItem}
					placeholder='Select week'
					selection
					onChange={onChangeActiveItem}
					options={weekOptions} />
			</Form.Field>
		)
	}

	const renderNextMonthEstimateInput = () => {
		const label = `Total estimate for the month of ${moment(dateRange[0]).add(1, 'month').format('MMMM')}`

		const onChangeEstimate = (e) => { setNextMonthEstimate(e.target.value) }

		return invoiceMode === 'month' && (
			<Form.Field>
				<label>{label}</label>
				<Input labelPosition='left' type='text' placeholder='Amount'>
					<Label basic>$</Label>
					<input value={nextMonthEstimate} onChange={onChangeEstimate} />
				</Input>
			</Form.Field>
		)
	}

	const renderInvoiceForm = () => {
		const onChangeInvoiceNumber = (e) => setInvoiceNumber(e.target.value)
		const onChangeProject = (e, data) => setProject(data.value)
		const onChangeInvoiceMode = (e, data) => setInvoiceMode(data.value)
		const onChangeStartBalance = (e) => setBalance(e.target.value)
		const onChangeFromAddress = (e) => setFrom(e.target.value)
		const onChangeToAddress = (e) => setTo(e.target.value)

		const projectKeys = Object.keys(projects)
		const dropdownOptions = projectKeys.map(key => ({
			key,
			value: key,
			text: projects[key].name

		}))
		const invoiceModeOptions = [
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
		]
		const startBalanceLabel = `Starting ${isInvoiceModeWeek ? 'week' : 'monthly'} balance`
		const endBalanceLabel = `Ending ${isInvoiceModeWeek ? 'week' : 'monthly'} balance`
		const invoice = isInvoiceModeMonth
			? weekInvoiceData.Total
			: weekInvoiceData[activeItem]
		const endBalance = (Number(balance) - Number(invoice?.total?.usd.toFixed(2))).toFixed(2)

		return (
			<Form>
				<Form.Field>
					<label>Period</label>
					<div id='date-range-picker'>
						<DateRangePicker
							onChange={onChangeDateRange}
							value={dateRange}
						/>
					</div>
				</Form.Field>
				<Form.Field>
					<label>Invoice Number</label>
					<Input labelPosition='left' type='text' placeholder='Amount'>
						<Label basic>#</Label>
						<input value={invoiceNumber} onChange={onChangeInvoiceNumber} />
					</Input>
				</Form.Field>
				<Form.Field>
					<label>Project</label>
					<Dropdown value={project} placeholder='Project' search selection
						onChange={onChangeProject}
						options={dropdownOptions} />
				</Form.Field>
				<Form.Field>
					<label>Invoice Mode</label>
					<Dropdown value={invoiceMode} placeholder='Select invoice mode' selection
						onChange={onChangeInvoiceMode}
						options={invoiceModeOptions} />
				</Form.Field>
				{renderSelectWeekDropdown()}
				<Form.Field>
					<label>{startBalanceLabel}</label>
					<Input labelPosition='left' type='text' placeholder='Amount'>
						<Label basic>$</Label>
						<input value={balance} onChange={onChangeStartBalance} />
					</Input>
				</Form.Field>
				<Form.Field>
					<label>{endBalanceLabel}</label>
					<Input labelPosition='left' type='text' placeholder='Amount'>
						<Label basic>$</Label>
						<input value={endBalance} readOnly onChange={(e) => { }} />
					</Input>
				</Form.Field>
				{renderNextMonthEstimateInput()}
				<Form.TextArea label='From' placeholder='From Address...' value={from} onChange={onChangeFromAddress} />
				<Form.TextArea label='To' placeholder='To Address...' onChange={onChangeToAddress} value={to} />
			</Form>
		)
	}


	const onChangeWorkerRole = (role, key) => {
		const updatedCardData = {
			...cardData,
			[activeItem]: {
				...cardData[activeItem],
				[key]: {
					...cardData[activeItem][key],
					role,
				}
			}
		}
		dispatch(setCardData(updatedCardData))
	}

	const [activeIndex, setActiveIndex] = useState()
	const onChangeActiveIndex = (e, data) => {
		const newIndex = (activeIndex === data.index) ? -1 : data.index
		setActiveIndex(newIndex)
	}
	const renderCardTables = () => cardData && cardData[activeItem] && Object.keys(cardData[activeItem]).map((key, index) => (
		<Accordion fluid styled>
			<Accordion.Title
          active={activeIndex === index}
          index={index}
          onClick={onChangeActiveIndex}
        >
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<div>
						<Icon name='dropdown' />
						{key}
					</div>
					<div>
						<b>Total No of Cards: {cardData[activeItem][key]?.total?.cardTotal}</b>
						,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<b>Average: {cardData[activeItem][key].role === 'Team Member' ? cardData[activeItem][key]?.total?.average?.asTeamMember : cardData[activeItem][key]?.total?.average?.asQAPerson}</b>
					</div>
				</div>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === index}>
		<Table celled >
			<Table.Header>
				<Table.Row >
					<Table.HeaderCell colSpan='7'>
						<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
							<span>{key} :</span>
							<Dropdown
								onChange={(e, data) => onChangeWorkerRole(data.value, key)}
								style={{ width: 200, border: 0, backgroundColor: '#f9fafb' }}
								placeholder='Select Role'
								fluid
								value={cardData[activeItem][key].role}
								selection
								options={[
									{
										key: 'Team Member',
										text: 'Team Member',
										value: 'Team Member',
									},
									{
										key: 'QA Person',
										text: 'QA Person',
										value: 'QA Person',
									},
								]}
							/>
						</div>
					</Table.HeaderCell>
				</Table.Row>
				<Table.Row>
					<Table.HeaderCell textAlign='center' width='2'>
						Card No
						</Table.HeaderCell>
					<Table.HeaderCell>
						Card Title
						</Table.HeaderCell>
					<Table.HeaderCell>
						In Progress
						</Table.HeaderCell>
					<Table.HeaderCell>
						In Peer Review
						</Table.HeaderCell>
					<Table.HeaderCell>
						In QA
						</Table.HeaderCell>
					<Table.HeaderCell>
						In Staging
						</Table.HeaderCell>
					<Table.HeaderCell textAlign='center' width='3'>
						No of Days
						</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{
					cardData[activeItem][key].cards?.map((card, index) => (
						<Table.Row>
							<Table.Cell textAlign='center'>
								{index + 1}
							</Table.Cell>
							<Table.Cell>
								{card.cardName}
							</Table.Cell>
							<Table.Cell>
								{
									moment(card.todoDate).format('DD/MM/YYYY')
									//moment(card.todoDate).format('DD/MM/YYYY') + '\n' + moment(card.actualToDoDate).format('DD/MM/YYYY')
								}
							</Table.Cell>
							<Table.Cell>
								{
									//moment(card.inPeerReview).format('DD/MM/YYYY') + '\n' + moment(card.actualInPeerReview).format('DD/MM/YYYY')
									moment(card.inPeerReview).format('DD/MM/YYYY')
								}
							</Table.Cell>
							<Table.Cell>
								{
									moment(card.inQADate).format('DD/MM/YYYY')
									//moment(card.inQADate).format('DD/MM/YYYY') + '\n' + moment(card.actualInQADate).format('DD/MM/YYYY')
								}
							</Table.Cell>
							<Table.Cell>
								{
									moment(card.inStagingDate).format('DD/MM/YYYY')
									// moment(card.inStagingDate).format('DD/MM/YYYY') + '\n' + moment(card.actualInStagingDate).format('DD/MM/YYYY')
								}
							</Table.Cell>
							<Table.Cell textAlign='center'>
								{cardData[activeItem][key].role === 'Team Member' ? card.noOfDaysWorkedAsTeamMember : card.noOfDaysWorkedAsQAPerson}
							</Table.Cell>
						</Table.Row>
					))
				}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.HeaderCell>
						<b></b>
					</Table.HeaderCell>
					<Table.HeaderCell>
						<b>Total No of Cards: {cardData[activeItem][key]?.total?.cardTotal}</b>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
						<b>Total No of Days: {cardData[activeItem][key].role === 'Team Member' ? cardData[activeItem][key]?.total?.totalDays?.asTeamMember : cardData[activeItem][key]?.total?.totalDays?.asQAPerson}</b>
					</Table.HeaderCell>

				</Table.Row>
				<Table.Row>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
					</Table.HeaderCell>
					<Table.HeaderCell>
						<b></b>
					</Table.HeaderCell>
					<Table.HeaderCell>
						<b>Average: {cardData[activeItem][key].role === 'Team Member' ? cardData[activeItem][key]?.total?.average?.asTeamMember : cardData[activeItem][key]?.total?.average?.asQAPerson}</b>
					</Table.HeaderCell>
				</Table.Row>
			</Table.Footer>
				</Table>
			</Accordion.Content>
		</Accordion>
	))


	const renderCardSection = () => (
		<Segment>
			{sprints && (<Header as='h5'>
				Sprint: {`${sprints[activeItem]?.start || '--'} : ${sprints[activeItem]?.end || '--'}`}
			</Header>)}
			{renderJSONFileInput()}
			{renderCardTables()}
		</Segment>
	)


	return (
		<>
			<AppHeader />
			<div className="home-container">
				<Grid>
					<Grid.Column mobile={16} tablet={5} computer={5}>
						{renderInvoiceForm()}
					</Grid.Column>
					<Grid.Column mobile={16} tablet={11} computer={11}>
						{renderHiddenFileInput()}
						{renderHiddenJSONFileInput()}
						{renderFileInput()}
						{renderInvoiceTabsAndTable()}
						<br />
						<br />
						{/* {renderJSONFileInput()} */}
						{renderCardSection()}
						{/* {renderCardTables()} */}
						<br />
						<br />
						{renderGenerateInvoiceButton()}
						{/* {renderDownloadInvoiceButton()} */}
					</Grid.Column>
				</Grid>
			</div>
		</>
	);
}

export { Home }