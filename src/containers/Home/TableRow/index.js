import { createRef, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Table, Dropdown, Input, Label, Icon, Button } from 'semantic-ui-react'
import { selectInvoiceData, setWeekInvoiceData } from "../../../store/invoiceSlice"
import { selectShouldEnableCardCalculation } from "../../../store/UISlice"
import { getNumbersInRangeAsArray } from '../../../utils/functions'

const TableRow = ({ data, no, name, setHourlyRate, onChangeHoursWorked, activeItem, cardData, deleteWorkerData, invoiceDataKeys }) => {

  const showCardColumns = useSelector(selectShouldEnableCardCalculation)

	const [hoursWorked, setHoursWorked] = useState(data.hoursWorked)
	const [isHoursWorkedValid, setIsHoursWorkedValid] = useState(true)
	const [shouldEdit, setShoudEdit] = useState(false)
	const [isWorkerExist, setIsWorkerExist] = useState(false)
	const [worker, setWorker] = useState({
		prevKey: name,
		newKey: name,
	})
	const dispatch = useDispatch()

	const weekInvoiceData = useSelector(selectInvoiceData)

	const editWorker = () => {
		if(worker.prevKey === worker.newKey){
			setWorker({
				...worker,
				newKey: worker.prevKey
			})
			setShoudEdit(false)
		} else if (isWorkerExist) {
			alert('Worker already exist!')
		} else {
			const updatedWeekInvoiceData = Object.keys(weekInvoiceData).reduce((newWeekInvoiceData, week) => {
				const tempWeekInvoiceData = {
					...weekInvoiceData
				}
				const weekData = { ...tempWeekInvoiceData[week].data }
				weekData[worker.newKey] = {
					...weekData[worker.prevKey],
					worker: worker.newKey
				}
				delete weekData[worker.prevKey]
				return {
					...newWeekInvoiceData,
					[week]: {
						...tempWeekInvoiceData[week],
						data: weekData
					}
				}
			}, {})
			console.log({ updatedWeekInvoiceData })
			dispatch(setWeekInvoiceData(updatedWeekInvoiceData))
			setShoudEdit(false)
			alert('Worker name updated!')
		}
	}

	const inputRef = createRef()

	useEffect(() => {
		setHoursWorked(data.hoursWorked)
	}, [data])

	return <Table.Row style={{ textAlign: 'center' }}>
		<Table.Cell >{no}</Table.Cell>
		<Table.Cell style={{ textAlign: 'left' }}>
			{
				shouldEdit ? <Input error={isWorkerExist} type='text' placeholder='Worker'>
					<input value={worker.newKey} onChange={(e) => {
						setIsWorkerExist((invoiceDataKeys.includes(e.target.value) ? true : false) && worker.prevKey !== e.target.value )
						setWorker({
							...worker,
							newKey: e.target.value
						})
					}} /><Button style={{ backgroundColor: 'transparent' }} onClick={editWorker} icon='check' /><Button style={{ backgroundColor: 'transparent' }} onClick={() => {
						setWorker({
							...worker,
							newKey: worker.prevKey
						})
						setShoudEdit(false)
					}} icon='cancel' />
				</Input> : <>{data.worker } <Button style={{backgroundColor: 'transparent'}} onClick={() => setShoudEdit(true)} icon='pencil alternate' /></>
			}

		</Table.Cell>
		{activeItem !== 'Total' && (<Table.Cell>
			<Input type='text' error={!isHoursWorkedValid} {...(data.hoursWorked !== hoursWorked) && { labelPosition: 'left' }} placeholder='Amount'>
				<input ref={inputRef} style={{ width: 100 }} value={hoursWorked} onChange={(e) => {
						// if (data.hoursWorked === e.target.value) {
						// 	setIsHoursWorkedValid(true)
						// }
					const hoursWorked = e.target.value;
					setHoursWorked(hoursWorked)
					const pattern = /^\d+:[0-5][0-9]$/
					const isValid = pattern.test(hoursWorked)
					if (isValid) {
						onChangeHoursWorked(name, hoursWorked)
						setIsHoursWorkedValid(true)
					} else {
						setIsHoursWorkedValid(false)
					}
					}} />
				{/* {(data.hoursWorked !== hoursWorked) && <Label onClick={() => {
					const pattern = /^\d+:[0-5][0-9]$/
					const isValid = pattern.test(hoursWorked)
					if (isValid) {
						onChangeHoursWorked(name, hoursWorked)
						setIsHoursWorkedValid(true)
					} else {
						setIsHoursWorkedValid(false)
					}
					}} basic style={{cursor: 'pointer'}}>Save</Label>} */}
				</Input>
			</Table.Cell>
		)}
		<Table.Cell>{data.hoursBilled}</Table.Cell>
		{/* <td>{hours}</td> */}
		<Table.Cell>
			<Dropdown
				search
				onChange={(e, data) => {
					setHourlyRate(name, Number(data.value))
				}}
				value={data.hourlyRate.toFixed(2)}
				fluid
				selection
				options={getNumbersInRangeAsArray(1, 25, 0.01).map((number) => ({
					key: number.toFixed(2),
					value: number.toFixed(2),
					text: '$'+number.toFixed(2)
				}))}
			/>
			{/* <Input type='text' {...(data.hourlyRate !== hourlyRate) && { labelPosition: 'left' }} placeholder='Amount'>
				<input style={{ textAlign: 'center' }} value={hoursWorked} onChange={(e) => {
					setHourlyRate
				}} />
				{(data.hoursWorked !== hoursWorked) && <Label onClick={() => {
					onChangeHoursWorked(name, hoursWorked)
				}} basic>Save</Label>}
			</Input> */}
		</Table.Cell>
		<Table.Cell>${data.totalInUSD.toFixed(2)}</Table.Cell>
		{
			showCardColumns && (
				<>
					<Table.Cell textAlign='center'>{cardData?.total?.cardTotal || '--'}</Table.Cell>
					<Table.Cell textAlign='center'>{(cardData?.role === 'Team Member' ? cardData?.total?.average?.asTeamMember : cardData?.total?.average?.asQAPerson) || '--'}</Table.Cell>
				</>
			)
		}
		<Table.Cell><Button onClick={() => deleteWorkerData(name) } icon='trash' /></Table.Cell>
		</Table.Row>
}

export { TableRow }
