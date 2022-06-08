import { useSelector } from "react-redux";
import { Table } from "semantic-ui-react";
import { selectShouldEnableCardCalculation } from "../../../store/UISlice";

export const TableHeader = ({ activeItem, invoiceMode }) => {
  const showCardColumns = useSelector(selectShouldEnableCardCalculation)
  return (
    <Table.Header>
      <Table.Row style={{ textAlign: 'center' }}>
        <Table.HeaderCell>#</Table.HeaderCell>
        <Table.HeaderCell style={{ textAlign: 'left' }}>Worker</Table.HeaderCell>
        {(activeItem !== 'Total' || invoiceMode === 'week') && <Table.HeaderCell width='2' >Hours Worked</Table.HeaderCell>}
        <Table.HeaderCell width='2' >Hours Billed</Table.HeaderCell>
        <Table.HeaderCell width='2' >Hourly Rate</Table.HeaderCell>
        <Table.HeaderCell width='2' >Total in USD</Table.HeaderCell>
        {
          showCardColumns && (
            <>
              <Table.HeaderCell width='2' >Number of tickets Assigned</Table.HeaderCell>
              <Table.HeaderCell width='2' >Avg age (in working days)</Table.HeaderCell>
            </>
          )
        }
        <Table.HeaderCell></Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  )
}