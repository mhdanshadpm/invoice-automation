import { Form, Grid } from "semantic-ui-react"
import { Header } from "../../components/Header"

export const Settings = () => {
  return (
    <>
      <Header />
      <div style={{ margin: 40 }}>
        <Grid>
          <Grid.Column mobile={16} tablet={11} computer={11}>
            <h3>Project Info</h3>
            <Form>
              {/* <Form.TextArea id='weekly_invoice_address' onBlur={formik.handleBlur} error={formik.touched.weekly_invoice_address && formik.errors.weekly_invoice_address} onChange={(e, { value }) => formik.setFieldValue('weekly_invoice_address', value)} label='Address ( Weekly Invoice )' placeholder='enter the address' value={formik.values.weekly_invoice_address} /> */}
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    </>
  )
}