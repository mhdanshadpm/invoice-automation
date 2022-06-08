import { useLocation } from 'react-router-dom';
import moment from 'moment';
import './index.css'
import { createRef } from 'react';
// import HTMLToDOCX from 'html-to-docx';
import { numberWithCommas } from '../../utils/functions';
import stringSimilarity from 'string-similarity';

const WeekInvoice = () => {
	const { state } = useLocation()
  const divRef = createRef();

  const bucket = `$ ${Number(state.endBalance) * -1}`

  const endBalance = `$ ${Number(state.endBalance)}`

  const totalPayable = (Number(state.nextMonthEstimate) - Number(state.endBalance)).toFixed(2)


	const getBestMatch = (key, array) => {
		var matches = stringSimilarity.findBestMatch(key, array);
		return matches?.bestMatch?.rating > 0.6 ? matches?.bestMatch?.target : key
	}
	return (
		<div ref={divRef} >


		<div style={{ width: 816, margin: '20px auto', minHeight: 1054 }} >
			<br />
				{
					(state.invoiceMode === 'week') ? (
						<>
							<div style={{
								fontSize: 18,
								fontFamily: 'Arial',
								marginBottom: 18,
								fontWeight: 900,
							}}>Invoice #{state.invoiceNumber}</div><br />
							<div style={{
								fontSize: 18,
								fontFamily: 'Arial',
								marginBottom: 15,
								fontWeight: 900,
							}}>Period: {moment(state.dates[0]).format('MMMM D ,YYYY ')} through {moment(state.dates[1]).format('MMMM D ,YYYY ')}</div>
						</>
					) : (
						<div style={{
							fontSize: 18,
							fontFamily: 'Arial',
							marginBottom: 15,
							fontWeight: 900,
              }}>Invoice #{state.invoiceNumber} - {moment(state.dates[0]).format('MMMM').toUpperCase()} {moment(state.dates[0]).format('YYYY')}</div>
					)
				}
			<br />
			<table width={815} border={1}cellSpacing={0} cellPadding={10} className=''>
				<tbody style={{
					verticalAlign: 'top',
					whiteSpace: 'pre-wrap',
					textAlign: 'left'
				}}>
					<tr>
						<th style={{width: '50%'}}>From</th>
						<th style={{width: '50%'}}>To</th>
					</tr>
					<tr>
						<td>{state.from}</td>
						<td>{state.to}</td>
					</tr>
				</tbody>
			</table>
			<br />
			<table width={815} border={1} cellSpacing={0} cellPadding={5} className=''>
				<tbody style={{
					textAlign: 'left'
				}}>
					<tr>
							<th style={{ width: 200 }}>{`Starting ${state?.invoiceMode==='week' ? 'week' : 'monthly' } balance`}</th>
              <td>$ {numberWithCommas(Number(state.startBalance).toFixed(2))}</td>
					</tr>
					<tr>
						<th style={{width: 200}}>{`Ending ${state?.invoiceMode==='week' ? 'week' : 'monthly' } balance`}</th>
              <td>{numberWithCommas(endBalance)}</td>
					</tr>
				</tbody>
			</table>
			<br />
			<div>
				Work Log - {state.project}
			</div>
			<br />
			<table width={815} border={1} cellSpacing={0} cellPadding={5} className='week-invoice'>
				<tbody style={{
					textAlign: 'center'
				}}>
					<tr>
						<th>#</th>
						<th style={{
							textAlign: 'left'
						}}>Worker</th>
						{(state?.invoiceMode === 'week') && <th>Hours Worked</th>}
						<th>Hours Billed</th>
						<th>Hourly Rate in USD</th>
						<th>Total in USD</th>
						<th>Number of tickets Assigned</th>
						<th>Avg age (in working days)</th>
					</tr>
					{Object.keys(state.invoiceData).map((key, index) => {
						const data = state.invoiceData[key];
						const hasCardData = state.cardData && Object.keys(state.cardData).length > 0;
						const cardKey = hasCardData ? getBestMatch(key, Object.keys(state.cardData) || Object.keys(state.invoiceData)) : key
						return (
							<tr key={key}>
								<td>{index + 1}</td>
								<td style={{
									textAlign: 'left'
								}}>{key}</td>
								{(state?.invoiceMode === 'week') && <td>{data.hoursWorked}</td>}
								<td>{data.hoursBilled}</td>
								<td>$ {data.hourlyRate}</td>
								<td>{Number(data.totalInUSD).toFixed(2)}</td>
								<td>{state.cardData[cardKey]?.total?.cardTotal || '--'}</td>
								<td>{(state.cardData[cardKey]?.role === 'Team Member' ? state.cardData[cardKey]?.total?.average?.asTeamMember : state.cardData[cardKey]?.total?.average?.asQAPerson ) || '--'}</td>
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					<tr>
						<th></th>
						<th style={{
                textAlign: 'left',
                paddingTop: 20,
                paddingBottom: 5,
							}}>Total</th>
              {(state?.invoiceMode === 'week') && <th style={{
                paddingTop: 20,
                paddingBottom: 5,
              }}>{state.total.hoursWorked}</th>}
              <th style={{
                paddingTop: 20,
                paddingBottom: 5,
              }}>{state.total.hoursBilled}</th>
						<th></th>
            <th style={{
              paddingTop: 20,
              paddingBottom: 5,
              }}>$ {numberWithCommas(parseFloat(state.total.usd).toFixed(2))}</th>
						<th></th>
						<th></th>
					</tr>
					{(state?.invoiceMode === 'month') && (
						<>
							<tr>
								<th></th>
								<th style={{
									textAlign: 'left'
								}}>Total estimate for the month of {moment(state.dates[0]).add(1, 'month').format('MMMM')}</th>
								<th> - </th>
								<th> - </th>
                  <th>$ {numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}</th>
								<th></th>
								<th></th>
							</tr>
							<tr>
								<th></th>
								<th style={{
									textAlign: 'left'
                  }}> {Number(state.endBalance) < 0 ? 'Unpaid' : 'Paid'}  bucket for {moment(state.dates[0]).format('MMMM')}
								</th>
								<th> - </th>
								<th> - </th>
                  <th>{numberWithCommas(bucket)}</th>
								<th></th>
								<th></th>
							</tr>
							<tr>
								<th></th>
								<th style={{
									textAlign: 'left'
								}}>Total Payable</th>
								<th> - </th>
								<th> - </th>
                  <th>$ {numberWithCommas(totalPayable)}</th>
								<th></th>
								<th></th>
							</tr>
						</>
					)}
				</tfoot>
			</table>
			<br />
			<div><b>
          Amount due: $ {numberWithCommas(totalPayable)}
			</b></div>
			<br />
        <div><p>Account balance after payment: ${numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}</p></div>
			</div>
		</div>
	)
}

export { WeekInvoice }