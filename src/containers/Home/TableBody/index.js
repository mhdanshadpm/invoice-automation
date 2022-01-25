import { TableRow } from "../TableRow"
import { Table } from 'semantic-ui-react'
import stringSimilarity from 'string-similarity';

const TableBody = ({ invoiceData, setHourlyRate, total, onChangeHoursWorked, activeItem, cardData }) => {

	const getBestMatch = (key) => {
		var matches = stringSimilarity.findBestMatch(key, Object.keys(cardData) || Object.key(invoiceData));
		console.log({ string: key, strings: Object.keys(cardData), matches })
		return matches?.bestMatch?.rating > 0.6 ? matches?.bestMatch?.target : key
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
								activeItem={activeItem}
								onChangeHoursWorked={onChangeHoursWorked}
								setHourlyRate={setHourlyRate}
								key={key}
								name={key}
								data={invoiceData[key]}
								no={index + 1}
								cardData={cardData && cardData[cardKey] || {}}
							/>
						)
					})
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
					<Table.HeaderCell><b></b></Table.HeaderCell>
					<Table.HeaderCell><b></b></Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</>
	)
}

export { TableBody }