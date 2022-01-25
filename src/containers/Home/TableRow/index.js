import { createRef, useEffect, useState } from "react"
import { Table, Dropdown, Input, Label } from 'semantic-ui-react'
import { getNumbersInRangeAsArray } from '../../../utils/functions'

const TableRow = ({ data, no, name, setHourlyRate, onChangeHoursWorked, activeItem, cardData }) => {

	const [hoursWorked, setHoursWorked] = useState(data.hoursWorked)
	const [isHoursWorkedValid, setIsHoursWorkedValid] = useState(true)
	const inputRef = createRef()

	useEffect(() => {
		setHoursWorked(data.hoursWorked)
	}, [data])

	return <Table.Row style={{ textAlign: 'center' }}>
		<Table.Cell >{no}</Table.Cell>
		<Table.Cell style={{ textAlign: 'left' }}>{data.worker}</Table.Cell>
		{activeItem !== 'Total' && (<Table.Cell>
			<Input type='text' error={!isHoursWorkedValid} {...(data.hoursWorked !== hoursWorked) && { labelPosition: 'left' }} placeholder='Amount'>
				<input ref={inputRef} style={{ width: 100 }} value={hoursWorked} onChange={(e) => {
						if (data.hoursWorked === e.target.value) {
							setIsHoursWorkedValid(true)
						}
						setHoursWorked(e.target.value)
					}} />
				{(data.hoursWorked !== hoursWorked) && <Label onClick={() => {
					const pattern = /^\d+:[0-5][0-9]$/
					const isValid = pattern.test(hoursWorked)
					if (isValid) {
						onChangeHoursWorked(name, hoursWorked)
						setIsHoursWorkedValid(true)
					} else {
						setIsHoursWorkedValid(false)
					}
					}} basic style={{cursor: 'pointer'}}>Save</Label>}
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
		<Table.Cell textAlign='center'>{cardData?.total?.cardTotal || '--'}</Table.Cell>
		<Table.Cell textAlign='center'>{(cardData?.role === 'Team Member' ? cardData?.total?.average?.asTeamMember : cardData?.total?.average?.asQAPerson) || '--'}</Table.Cell>
		</Table.Row>
}

export { TableRow }