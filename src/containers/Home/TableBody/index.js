import { TableRow } from "../TableRow"
import { Button, Dropdown, Form, Input, Table } from 'semantic-ui-react'
import stringSimilarity from 'string-similarity';
import { getNumbersInRangeAsArray } from "../../../utils/functions";
import { useState } from "react";
import moment from 'moment'
import { useSelector } from "react-redux";
import { selectShouldEnableCardCalculation } from "../../../store/UISlice";

const TableBody = ({ invoiceData, invoiceMode, setHourlyRate, total, onChangeHoursWorked, activeItem, cardData, addWorkerData, deleteWorkerData, billingRates }) => {


	const showCardColumns = useSelector(selectShouldEnableCardCalculation)

	const getBestMatch = (key) => {
		var matches = stringSimilarity.findBestMatch(key, Object.keys(cardData) || Object.key(invoiceData));
		return matches?.bestMatch?.rating > 0.6 ? matches?.bestMatch?.target : key
	}



	const initialWorkerData = {
		hourlyRate: 1,
		worker: '',
		hours: 0,
		hoursBilled: '00:00',
		hoursWorked: '',
		timeWorked: 0,
		totalInUSD: 1,
	}
	const [isHoursWorkedValid, setIsHoursWorkedValid] = useState(true)
	const [isWorkerExist, setIsWorkerExist] = useState(false)
	const [workerData, setWorkerData] = useState(initialWorkerData)

	const updateWorkerData = (data) => setWorkerData(state => ({
		...state,
		...data,
	}))

	const addWorker = () => {
		if (isWorkerExist) {
			alert('Worker already exist')
		} else if (!isHoursWorkedValid) {
			alert('Invalid time(Hours Worked)')
		} else {
			addWorkerData(workerData.worker, workerData)
			setWorkerData(initialWorkerData)
		}
	}

	return (
			<>
		<Table.Body>
			{
				Object
						.keys(invoiceData)
						.sort()
						.map((key, index) => {
							const hasCardData = cardData && Object.keys(cardData).length > 0;
						const cardKey = hasCardData ? getBestMatch(key) : key
						return (
							<TableRow
								invoiceMode={invoiceMode}
								activeItem={activeItem}
								onChangeHoursWorked={onChangeHoursWorked}
								setHourlyRate={setHourlyRate}
								key={key}
								name={key}
								deleteWorkerData={deleteWorkerData}
								data={invoiceData[key]}
								invoiceDataKeys={Object.keys(invoiceData)}
								no={index + 1}
								cardData={cardData && cardData[cardKey] || {}}
							/>
						)
					})
				}
				{
					activeItem !== 'Total' && <Table.Row textAlign='center'>
						<Table.Cell></Table.Cell>
						<Table.Cell>
							<Form.Field>
								<Input style={{ width: '100%' }} error={isWorkerExist} type='text' placeholder='Worker'>
									<input value={workerData.worker} onChange={(e) => {
										setIsWorkerExist(Object.keys(invoiceData).includes(e.target.value) ? true : false)
										var matches = [];
										if (Object.keys(billingRates)?.length > 0 && e.target.value) {
											matches = stringSimilarity.findBestMatch(e.target.value, Object.keys(billingRates))
										}
										const bestMatch = matches?.bestMatch?.rating > 0.6 ? matches?.bestMatch?.target : ''
										const hourlyRate = bestMatch ? billingRates[bestMatch] : 1;
										updateWorkerData({ worker: e.target.value, hourlyRate })
									}} />
								</Input>
							</Form.Field>
						</Table.Cell>
						<Table.Cell>
							<Form.Field>
								<Input error={!isHoursWorkedValid} type='text' placeholder='Hours Worked'>
									<input style={{ width: '100%' }} value={workerData.hoursWorked} onChange={(e) => {
										const pattern = /^\d+:[0-5][0-9]$/
										const isValid = pattern.test(e.target.value)
										if (isValid) {
											const splittedTime = e.target.value.split(':');
											const billedMinutes = moment.utc((parseInt(splittedTime[1] / 10) * 10) * 60000).format('mm');
											const hoursBilled = splittedTime[0] + ':' + billedMinutes
											const hours = Number(splittedTime[0]) + Number(billedMinutes) / 60;
											const totalInUSD = hours * workerData.hourlyRate;
											const timeWorked = (Number(splittedTime[0]) * 60 * 60) + (Number(splittedTime[0]) * 60)
											updateWorkerData({
												hoursWorked: e.target.value,
												hoursBilled,
												totalInUSD,
												hours,
												timeWorked,
											})
											setIsHoursWorkedValid(true)
										} else {
											updateWorkerData({ hoursWorked: e.target.value })
											setIsHoursWorkedValid(false)
										}

									}} />
								</Input>
							</Form.Field>
						</Table.Cell>
						<Table.Cell>{workerData.hoursBilled}</Table.Cell>
						<Table.Cell>
							<Dropdown
								search
								onChange={(e, data) => {
									updateWorkerData({
										hourlyRate: Number(data.value),
										totalInUSD: Number(data.value) * workerData.hours
									})
								}}
								value={workerData.hourlyRate.toFixed(2)}
								fluid
								selection
								options={getNumbersInRangeAsArray(1, 25, 0.01).map((number) => ({
									key: number.toFixed(2),
									value: number.toFixed(2),
									text: '$' + number.toFixed(2)
								}))}
							/>
						</Table.Cell>
						<Table.Cell>${workerData.totalInUSD.toFixed(2)}</Table.Cell>
						{
							showCardColumns && (
								<>
									<Table.Cell></Table.Cell>
									<Table.Cell></Table.Cell>
								</>
							)
						}
						<Table.Cell><Button onClick={addWorker}>Add</Button></Table.Cell>
					</Table.Row>
				}
			</Table.Body>
			<Table.Footer>
					<Table.Row>
						<Table.HeaderCell><br></br></Table.HeaderCell>
					<Table.HeaderCell><b>Total</b></Table.HeaderCell>
					{ (activeItem !== 'Total' || invoiceMode === 'week') && (<Table.HeaderCell><b>{total.hoursWorked}</b></Table.HeaderCell>)}
					<Table.HeaderCell><b>{total.hoursBilled}</b></Table.HeaderCell>
						<Table.HeaderCell><b></b></Table.HeaderCell>
					<Table.HeaderCell><b>${total.usd?.toFixed(2)?.toString()}</b></Table.HeaderCell>
					{
						showCardColumns && (
							<>
								<Table.HeaderCell><b></b></Table.HeaderCell>
								<Table.HeaderCell><b></b></Table.HeaderCell>
							</>
						)
					}
					<Table.HeaderCell><b></b></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</>
	)
}

export { TableBody }