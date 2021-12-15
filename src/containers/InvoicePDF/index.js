import React, { useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { numberWithCommas } from '../../utils/functions';
import arialBold from '../../assets/fonts/Arial_Bold.ttf';
import arial from '../../assets/fonts/Arial.ttf';

Font.register({
  family: 'Arial', fonts: [
    { src: arial, fontWeight: 'normal' },
    { src: arialBold, fontStyle: 'normal', fontWeight: 'bold' },
  ]
});

// Create Document Component
export const InvoicePDF = () => {
  const { state } = useLocation()
  const bucket = `$ ${Number(state.endBalance) * -1}`
  const endBalance = `$ ${Number(state.endBalance)}`
  const totalPayable = (Number(state.nextMonthEstimate) - Number(state.endBalance)).toFixed(2)

  const isWeekMode = (state?.invoiceMode === 'week')

  const renderAddressTable = () => (
    <View style={styles.table}>
      <View style={{ flexDirection: 'row', borderWidth: 1, marginRight: 40}}>
        <Text style={[styles.cellText, styles.cellBoldText, {borderRightWidth: 1}]}>From</Text>
        <Text style={[styles.cellText, styles.cellBoldText]}>To</Text>
      </View>
      <View style={{ flexDirection: 'row', marginRight: 40, borderWidth: 1, borderTopWidth: 0, top: -1}}>
        <Text style={[styles.cellText, { borderRightWidth: 1, paddingBottom: 20, }]}>{state.from}</Text>
        <Text style={[styles.cellText, { paddingBottom: 20,}]}>{state.to}</Text>
      </View>
    </View>
  )

  const renderBalanceTable = () => (
    <View style={{marginTop: 15}}>
      <View style={{ flexDirection: 'row', borderWidth: 1, marginRight: 40 }}>
        <Text style={[styles.cellText, styles.cellBoldText, {borderRightWidth: 1}]}>{`Starting ${state?.invoiceMode === 'week' ? 'week' : 'monthly'} balance`}</Text>
        <Text style={[styles.cellText, {flex: 2}]}>$ {numberWithCommas(Number(state.startBalance).toFixed(2))}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginRight: 40, borderWidth: 1, borderTopWidth: 0, top: -1 }}>
        <Text style={[styles.cellText, styles.cellBoldText, {borderRightWidth: 1}]}>{`Ending ${state?.invoiceMode === 'week' ? 'week' : 'monthly'} balance`}</Text>
        <Text style={[styles.cellText, { flex: 2 }]}>{numberWithCommas(endBalance)}</Text>
      </View>
    </View>
  )

  const renderInvoiceTable = () => (
    <View style={styles.table}>
      <View style={{flexDirection: 'row', fontFamily: 'Arial', fontWeight: 'bold', fontSize: 11, marginRight: 33, lineHeight: 1.3}}>
        <Text style={{ padding: 5, textAlign: 'center', width: 20, borderWidth: 1}}>#</Text>
        <Text style={{ padding: 5, textAlign: 'center', flex: 1, borderWidth: 1, left: -1}}>Worker</Text>
        {(state?.invoiceMode === 'week') && <Text style={{  padding: 5, textAlign: 'center', width: 55, borderWidth: 1, left: -2 }}>Hours Worked</Text>}
        <Text style={{ padding: 5, textAlign: 'center', width: 55, borderWidth: 1, left: isWeekMode ? -3 : -2}}>Hours Billed</Text>
        <Text style={{padding: 5, textAlign: 'center', width: 50, borderWidth: 1, left: isWeekMode ? -4 : -3}}>Hourly Rate in USD</Text>
        <Text style={{ padding: 5, textAlign: 'center', width: 80, borderWidth: 1, left: isWeekMode ? -5 : -4}}>Total in USD</Text>
        <Text style={{ padding: 5, textAlign: 'center', width: 65, borderWidth: 1, left: isWeekMode ? -6 : -5}}>Number of tickets Assigned</Text>
        <Text style={{ padding: 5, textAlign: 'center', width: 85, borderWidth: 1, left: isWeekMode ? -7 : -6 }}>Avg age (in working{'\n'}days)</Text>
      </View>
      {Object.keys(state.invoiceData).map((key, index) => {
        const data = state.invoiceData[key]
        return (
          <View style={{ flexDirection: 'row', fontFamily: 'Arial', fontWeight: 'normal', fontSize: 11, marginRight: 33, lineHeight: 1, top: -(index+1)}}>
            <Text style={{ padding: 5, textAlign: 'center', width: 20, borderWidth: 1 }}>{index + 1}</Text>
            <Text style={{ padding: 5, textAlign: 'left', flex: 1, borderWidth: 1, left: -1 }}>{key}</Text>
            {(state?.invoiceMode === 'week') && <Text style={{ padding: 5, textAlign: 'center', width: 55, borderWidth: 1, left: -2 }}>{data.hoursWorked}</Text>}
            <Text style={{  padding: 5, textAlign: 'center', width: 55, borderWidth: 1, left: isWeekMode ? -3 : -2 }}>{data.hoursBilled}</Text>
            <Text style={{ padding: 5, textAlign: 'center', width: 50, borderWidth: 1, left: isWeekMode ? -4 : -3 }}>$ {data.hourlyRate}</Text>
            <Text style={{ padding: 5, textAlign: 'center', width: 80, borderWidth: 1, left: isWeekMode ? -5 : -4 }}>{Number(data.totalInUSD).toFixed(2)}</Text>
            <Text style={{ padding: 5, textAlign: 'center', width: 65, borderWidth: 1, left: isWeekMode ? -6 : -5 }}> {state.cardData[key]?.total?.cardTotal || '--'}</Text>
            <Text style={{ padding: 5, textAlign: 'center', width: 85, borderWidth: 1, left: isWeekMode ? -7 : -6 }}> {(state.cardData[key]?.role === 'Team Member' ? state.cardData[key]?.total?.average?.asTeamMember : state.cardData[key]?.total?.average?.asQAPerson) || '--'} </Text>
          </View>
        )
      })}
      <View style={{ flexDirection: 'row', fontFamily: 'Arial', fontWeight: 'bold', fontSize: 11, marginRight: 33, lineHeight: 1.3, top: -Object.keys(state.invoiceData).length - 1}}>
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 20, borderWidth: 1 }}></Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'left', flex: 1, borderWidth: 1, left: -1, alignSelf: 'flex-end' }}>{isWeekMode ? 'Total' : 'Billed Total' }</Text>
        {(state?.invoiceMode === 'week') && <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 55, borderWidth: 1, left: -2 }}>{state.total.hoursWorked}</Text>}
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 55, borderWidth: 1, left: isWeekMode ? -3 : -2 }}>{state.total.hoursBilled}</Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 50, borderWidth: 1, left: isWeekMode ? -4 : -3 }}></Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 80, borderWidth: 1, left: isWeekMode ? -5 : -4 }}>$ {numberWithCommas(parseFloat(state.total.usd).toFixed(2))}</Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 65, borderWidth: 1, left: isWeekMode ? -6 : -5 }}></Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom:0, height:30, paddingTop: 15, textAlign: 'center', width: 85, borderWidth: 1, left: isWeekMode ? -7 : -6 }}></Text>
      </View>
    </View>
  )
  const renderMonthInvoiceDetails = () => {
    const data = [
      { title: `Total estimate for the month of ${moment(state.dates[0]).add(1, 'month').format('MMMM')}`, value: `$ ${numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}` },
      { title: `${Number(state.endBalance) < 0 ? 'Unpaid' : 'Paid' }  bucket for ${ moment(state.dates[0]).format('MMMM')}`, value: numberWithCommas(bucket)},
      { title: 'Total Payable', value: `$ ${numberWithCommas(totalPayable)}`},
    ]
    return state.invoiceMode === 'month' && data.map((item, index) => (
      <View style={{ flexDirection: 'row', fontFamily: 'Arial', fontWeight: 'bold', fontSize: 11, marginRight: 33, lineHeight: 1.3, top: -Object.keys(state.invoiceData).length - 1 - ( index + 1) }}>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'center', width: 20, borderWidth: 1 }}></Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'left', flex: 1, borderWidth: 1, left: -1, alignSelf: 'flex-end' }}>{item.title}</Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'center', width: 55, borderWidth: 1, left: -2 }}> - </Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'center', width: 50, borderWidth: 1, left: -3 }}> - </Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'center', width: 80, borderWidth: 1, left: -4 }}>{item.value}</Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'center', width: 65, borderWidth: 1, left: -5 }}></Text>
        <Text style={{ paddingHorizontal: 5, paddingBottom: 0, height: 30, paddingTop: 15, textAlign: 'center', width: 85, borderWidth: 1, left: -6 }}></Text>
      </View>
    ))
  }

  const renderDueAndBalance = () => (
    <View>
      <View style={{paddingTop: 5}}>
        <Text style={{
          fontSize: 11,
          fontFamily: 'Arial',
          fontWeight: 'bold'
        }}>Amount due: $ {isWeekMode ? '--' : numberWithCommas(totalPayable)}</Text>
      </View>
      <View style={{paddingTop: 5}}>
        <Text style={{
          fontSize: 11,
          fontFamily: 'Arial',
          fontWeight: 'normal'
        }}>Account balance after payment: <Text style={{fontWeight: 'bold'}}>${isWeekMode ? '--' : numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}</Text></Text>
      </View>
    </View>
  )

  return (
    <PDFViewer style={styles.document}>
      <Document>
        <Page size="LETTER" style={styles.page}>
          {
            (state.invoiceMode === 'week') ? (
              <>
                <View style={styles.section}>
                  <Text>Invoice #{state.invoiceNumber}</Text>
                </View>
                <View style={styles.section}>
                  <Text>Period: {moment(state.dates[0]).format('MMMM D ,YYYY ')} through {moment(state.dates[1]).format('MMMM D ,YYYY ')}</Text>
                </View>
              </>
            ) : (
              <View style={styles.section}>
                  <Text>Invoice #{state.invoiceNumber} - {moment(state.dates[0]).format('MMMM').toUpperCase()} {moment(state.dates[0]).format('YYYY')}</Text>
              </View>
            )
          }
          {renderAddressTable()}
          {renderBalanceTable()}
          <Text style={{
            fontFamily: 'Arial',
            marginTop: 10,
            marginBottom: 5,
            fontSize: 11,
            color: '#454545'
          }}>Work Log - <Text style={{ fontWeight: 'bold' }}>{state.project}</Text></Text>
          {renderInvoiceTable()}
          {renderMonthInvoiceDetails()}
          {renderDueAndBalance()}
        </Page>
      </Document>
    </PDFViewer>
  );
}

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    fontFamily: 'Arial',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
  document: {
    width: '100vw',
    height: '100vh'
  },
  table: {
    // borderWidth: 1,
    width: '100%',
  },
  cellBoldText: {
    fontWeight: 'bold',
  },
  cellText: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'normal',
    padding: 5,
    fontFamily: 'Arial'
  }
});
