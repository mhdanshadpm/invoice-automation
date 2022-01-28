import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTable } from "react-table";
import { useLocation } from "react-router-dom";
import moment from 'moment';
import stringSimilarity from 'string-similarity';
import { get } from "firebase/database";
import { getNextDayOfTheWeek, numberWithCommas } from "../../utils/functions";
import jsPDF from "jspdf";
import { Button } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { selectProjects, storeProjects } from "../../store/projectsSlice";
import { useDispatch } from "react-redux";
import { useFirebase } from "../../firebase";
import { selectAppData } from "../../store/invoiceSlice";
import { selectShouldEnableCardCalculation } from "../../store/UISlice";


const Styles = styled.div`
  padding: 1rem;
  font-size: 15px;
  font-weight: 'normal';
  font-family: 'Arial';
  h2 {
    font-size: 24px;
    font-weight: 900;
  }
  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell, index) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    style={{
                      fontSize: "92px"
                    }}
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AddressTable({ columns, data}) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  return (
    <table style={{ width: "100%" }} {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                style={{ width: "50%", textAlign: "left" }}
                {...column.getHeaderProps()}
              >
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} style={{
        verticalAlign: 'top',
        whiteSpace: 'pre-wrap',
        textAlign: 'left'
      }}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function BillingInfoTable({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  return (
    <table style={{ width: "100%" }} {...getTableProps()}>
      <tbody {...getTableBodyProps()} style={{
        verticalAlign: 'top',
        whiteSpace: 'pre-wrap',
        textAlign: 'left'
      }}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell, index) => {
                return <td style={{ width: "50%", textAlign: index === 0 ? "left" : "right" }} {...cell.getCellProps()}><b>{cell.render("Cell")}</b></td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function InvoiceTable({ columns, data, state }) {

  const showCardColumns = useSelector(selectShouldEnableCardCalculation)
  const bucket = `$ ${Number(state.endBalance) * -1}`
  const endBalance = `$ ${Number(state.endBalance)}`
  const totalPayable = (Number(state.nextMonthEstimate) - Number(state.endBalance)).toFixed(2)
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  const getStyle = (id) => {
    switch (id) {
      case "worker": return {
        flex: 1,
        textAlign: 'left'
      }
      case "hoursBilled":
      case "hourlyRate":
      case "hoursWorked":
      case "noOfTickets": return {
        width: 80,
        textAlign: 'center'
      }
      case "averageAge":
      case "totalInUSD": return {
        width: 100,
        textAlign: 'center'
      }
      default: return {
        width: 'auto',
        textAlign: 'center'
      }
    }
  }
  return (
    <table style={{ width: "100%" }} {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            <th>#</th>
            {headerGroup.headers.map((column) => {
              return (
                <th
                  style={getStyle(column.id)}
                  {...column.getHeaderProps()}
                >
                  {column.render("Header")}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} >
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              <td>{i + 1}</td>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()} style={getStyle(cell.column.id)} >{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
        <tr style={{fontWeight: 'bolder', textAlign: 'center'}}>
          <td></td>
          <td style={{
            textAlign: 'left',
            paddingTop: 20,
            paddingBottom: 5,
          }}>Total</td>
          {(state?.invoiceMode === 'week') && <td style={{
            paddingTop: 20,
            paddingBottom: 5,
          }}>{state.total.hoursWorked}</td>}
          <td style={{
            paddingTop: 20,
            paddingBottom: 5,
          }}>{state.total.hoursBilled}</td>
          <td></td>
          <td style={{
            paddingTop: 20,
            paddingBottom: 5,
          }}>$ {numberWithCommas(parseFloat(state.total.usd).toFixed(2))}</td>
          {
            showCardColumns && (
              <>
                <td></td>
                <td></td>
              </>
            )
          }
        </tr>
        {(state?.invoiceMode === 'month') && (
          <>
            <tr style={{
              fontWeight: 'bolder',
              textAlign: 'center',
            }}>
              <td></td>
              <td style={{
                textAlign: 'left'
              }}>Total estimate for the month of {moment(state.dates[0]).add(1, 'month').format('MMMM')}</td>
              <td> - </td>
              <td> - </td>
              <td>$ {numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}</td>
              {
                showCardColumns && (
                  <>
                    <td></td>
                    <td></td>
                  </>
                )
              }
            </tr>
            <tr style={{
              fontWeight: 'bolder',
              textAlign: 'center',
            }}>
              <td></td>
              <td style={{
                textAlign: 'left'
              }}> {Number(state.endBalance) < 0 ? 'Unpaid' : 'Paid'}  bucket for {moment(state.dates[0]).format('MMMM')}
              </td>
              <td> - </td>
              <td> - </td>
              <td>{numberWithCommas(bucket)}</td>
              {
                showCardColumns && (
                  <>
                    <td></td>
                    <td></td>
                  </>
                )
              }
            </tr>
            <tr style={{
              fontWeight: 'bolder',
              textAlign: 'center',
            }}>
              <td></td>
              <td style={{
                textAlign: 'left'
              }}>Total Payable</td>
              <td> - </td>
              <td> - </td>
              <td>$ {numberWithCommas(totalPayable)}</td>
              {
                showCardColumns && (
                  <>
                    <td></td>
                    <td></td>
                  </>
                )
              }
            </tr>
          </>
        )}
      </tbody>
      {/* <tfoot>

      </tfoot> */}
    </table>
  );
}

function BalanceTable({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  // Render the UI for your table
  return (
    <table style={{ width: "100%" }} {...getTableProps()}>
      {/* <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th style={{width: '50%', textAlign: 'left'}} {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead> */}
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <>
              <tr {...row.getRowProps()}>
                {row.cells.map((cell, index) => {
                  return <td {...(index === 0 && {
                    style: {
                      fontWeight: 'bold',
                      width: 200,
                    }
                  })} {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                })}
              </tr>

            </>
          );
        })}
      </tbody>
    </table>
  );
}

function Invoice() {
  const { state } = useLocation()

  const showCardColumns = useSelector(selectShouldEnableCardCalculation)

  const { getProjectsList, setProject, setInvoiceAppInfo } = useFirebase()

  const projects = useSelector(selectProjects);
  const appData = useSelector(selectAppData);
  const dispatch = useDispatch();

  const [showPrintButton, setShowPrintButton] = useState(true)

  const printAsPDF = () => {
    setShowPrintButton(false)
    setTimeout(() => {
      window.print()
      setShowPrintButton(true)
    }, 0)

  }

  const updateProjectsList = () => {
    return getProjectsList().then(r => {
      const projects = r.docs.reduce((_projects, doc) => ({
        ..._projects,
        [doc.id]: doc.data(),
      }), {})
      dispatch(storeProjects(projects))

    })
  }

  const saveBalance = () => {
    const project = projects[state.project.key]
    if (state.invoiceMode === 'month') {
      setProject(state.project.key, {
        ...project,
        month_balance: state.endBalance
      }).then(r => updateProjectsList().then(() => {
        setInvoiceAppInfo({
          ...appData,
          last_invoice_number: state.invoiceNumber
        }).then(() => alert('Saved successfully'))
      })).catch(() => alert('Something went wrong'))
    } else {
      setProject(state.project.key, {
        ...project,
        week_balance: state.endBalance
      }).then(r => updateProjectsList().then(() => {
        setInvoiceAppInfo({
          ...appData,
          last_invoice_number: state.invoiceNumber
        }).then(() => alert('Saved successfully'))
      })).catch(() => alert('Something went wrong'))
    }
  }

  const totalPayable = (Number(state.nextMonthEstimate) - Number(state.endBalance)).toFixed(2)

  const getBestMatch = (key, array) => {
    var matches = stringSimilarity.findBestMatch(key, array);
    return matches?.bestMatch?.rating > 0.6 ? matches?.bestMatch?.target : key
  }

  const addressTableColumns = React.useMemo(
    () => [
      {
        Header: "From",
        accessor: "from"
      },
      {
        Header: "To",
        accessor: "to"
      }
    ],
    []
  );
  const billingInfoTableColumns = React.useMemo(
    () => [
      {
        Header: '',
        accessor: 'period'
      },
      {
        Header:'',
        accessor:  'billingDate',
      }
    ],
    []
  );
  const balanceTableColumns = React.useMemo(
    () => [
      {
        Header: "Labels",
        accessor: "label"
      },
      {
        Header: "Balance",
        accessor: "value"
      }
    ],
    []
  );

  const invoiceTableColumns = React.useMemo(
    () => [
      {
        Header: "Worker",
        accessor: "worker"
      },
      ...(state.invoiceMode === 'week' ? [{Header: 'Hours Worked', accessor: 'hoursWorked'}] : []),
      {
        Header: "Hours Billed",
        accessor: "hoursBilled"
      },
      {
        Header: "Hourly Rate in USD",
        accessor: "hourlyRate"
      },
      {
        Header: "Total in USD",
        accessor: "totalInUSD"
      },
      ...(showCardColumns ? [
        {
          Header: "Number of tickets Assigned",
          accessor: "noOfTickets"
        },
        {
          Header: "Avg age (in working days)",
          accessor: "averageAge"
        },
      ] : [])
    ],
    []
  );

  const addressData = React.useMemo(
    () => [
      {
        from: state.from,
        to: state.to,
      }
    ],
    []
  );
  const billingData = React.useMemo(
    () => [
      {
        period: `Billing Period:  ${moment(state.dates[0]).format('Do')} to ${moment(state.dates[1]).format('Do')} ${moment(state.dates[0]).format('MMMM YYYY')}`,
        billingDate: `Invoice Date:${moment(state.dates[1]).add(1, 'days').weekday() === 0 ? moment(state.dates[1]).add(2, 'days').format('DD-MM-YYYY') :  moment(state.dates[1]).add(1, 'days').format('DD-MM-YYYY')}`,
      }
    ],
    []
  );
  const balanceData = React.useMemo(
    () => [
      { label: `Starting ${state?.invoiceMode === 'week' ? 'week' : 'monthly'} balance`, value: '$ ' + numberWithCommas(Number(state.startBalance).toFixed(2)) },
      { label: `Ending ${state?.invoiceMode === 'week' ? 'week' : 'monthly'} balance`, value: '$ ' + numberWithCommas(Number(state.endBalance).toFixed(2)) }
    ],
    []
  );

  const invoiceData = Object.keys(state.invoiceData).sort().map((key, index) => {
    const data = state.invoiceData[key];
    const hasCardData = state.cardData && Object.keys(state.cardData).length > 0;
    const cardKey = hasCardData ? getBestMatch(key, Object.keys(state.cardData) || Object.keys(state.invoiceData)) : key
    return {
      worker: key,
      hoursBilled: data.hoursBilled,
      hoursWorked: data.hoursWorked,
      hourlyRate: data.hourlyRate,
      totalInUSD: Number(data.totalInUSD).toFixed(2),
      noOfTickets: (state?.cardData && state?.cardData[cardKey]?.total?.cardTotal) || '--',
      averageAge: (state?.cardData && state?.cardData[cardKey]?.role === 'Team Member' ? state.cardData[cardKey]?.total?.average?.asTeamMember : (state?.cardData && state.cardData[cardKey]?.total?.average?.asQAPerson) || '--')
    }
  })


  return (
    <Styles>
      {
        showPrintButton && (
          <div style={{padding: 10, marginBottom: 50, boxShadow: '0px 1px 3px grey'}}>
            <Button onClick={printAsPDF}>Print</Button>
            <Button onClick={saveBalance}>Save Balance & Invoice Number</Button>
          </div>
        )
      }
      <div style={{ width: 800, margin: "auto", paddingRight: 30 }}>
        {
          (state.invoiceMode === 'week') ? (
            <>
              <h2>Invoice #{state.invoiceNumber}</h2>
              <h2>Period: {moment(state.dates[0]).format('MMMM D ,YYYY ')} through {moment(state.dates[1]).format('MMMM D ,YYYY ')}</h2>
            </>
          ) : (
              <h2>Invoice #{state.invoiceNumber} - {moment(state.dates[0]).format('MMMM').toUpperCase()} {moment(state.dates[0]).format('YYYY')}</h2>
            )
        }
        {/* <Table columns={columns} data={data} /> */}
        <br /><BillingInfoTable columns={billingInfoTableColumns} data={billingData} />
        <br /><AddressTable columns={addressTableColumns} data={addressData} />
        <br /><BalanceTable columns={balanceTableColumns} data={balanceData} />
        <br />
        <div style={{ color: '#525659' }}>
          Work Log - <span style={{fontWeight: 'bolder'}}>{state.project.name}</span>
        </div>
        <br /><InvoiceTable columns={invoiceTableColumns} data={invoiceData} state={state} />
        <br />
        <div><b>
          Amount due: $ {numberWithCommas(totalPayable)}
        </b></div>
        <div><p>Account balance after payment: <span style={{ fontWeight: 'bolder' }}>${numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}</span></p></div>

      </div>
    </Styles>
  );
}

export default Invoice;
