import { TableRow } from "../TableRow"
import { Table } from 'semantic-ui-react'

const TableBody = ({ invoiceData, setHourlyRate, total, onChangeHoursWorked, activeItem }) => {
	console.log({total})

	return (
			<>
		<Table.Body>
			{
				Object
					.keys(invoiceData)
					.sort()
					.map((key, index) => (
						<TableRow
							activeItem={activeItem}
							onChangeHoursWorked={onChangeHoursWorked}
							setHourlyRate={setHourlyRate}
							key={key}
							name={key}
							data={invoiceData[key]}
							no={index + 1}
						/>
					))
				}
			</Table.Body>
			<Table.Footer>
					<Table.Row>
						<Table.HeaderCell><br></br></Table.HeaderCell>
					<Table.HeaderCell><b>Total</b></Table.HeaderCell>
					{ activeItem !== 'Total' && (<Table.HeaderCell><b>{total.hoursWorked}</b></Table.HeaderCell>)}
					<Table.HeaderCell><b>{total.hoursBilled}</b></Table.HeaderCell>
						<Table.HeaderCell><b></b></Table.HeaderCell>
					<Table.HeaderCell><b>${total.usd?.toFixed(2)?.toString()}</b></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</>
	)
}

export { TableBody }