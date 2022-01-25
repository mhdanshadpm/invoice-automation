import { Table } from "semantic-ui-react";

export const TableHeader = ({ activeItem }) => (
  <Table.Header>
    <Table.Row style={{textAlign: 'center'}}>
      <Table.HeaderCell>#</Table.HeaderCell>
      <Table.HeaderCell style={{ textAlign: 'left' }}>Worker</Table.HeaderCell>
      {activeItem !== 'Total' && <Table.HeaderCell width='2' >Hours Worked</Table.HeaderCell>}
      <Table.HeaderCell width='2' >Hours Billed</Table.HeaderCell>
      <Table.HeaderCell width='2' >Hourly Rate</Table.HeaderCell>
      <Table.HeaderCell width='2' >Total in USD</Table.HeaderCell>
      <Table.HeaderCell width='2' >Number of tickets Assigned</Table.HeaderCell>
      <Table.HeaderCell width='2' >Avg age (in working days)</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
)