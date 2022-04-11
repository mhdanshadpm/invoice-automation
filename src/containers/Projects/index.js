import { useFormik } from "formik"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Form, Grid, List, Input, Label, Button, Confirm, Table, Dropdown, Icon, Dimmer, Loader } from "semantic-ui-react"
import { useFirebase } from "../../firebase"
import { selectProjects, storeProjects } from "../../store/projectsSlice"
import { Header } from "../../components/Header";
import * as Yup from 'yup';
import { getNumbersInRangeAsArray } from "../../utils/functions"

export const Projects = () => {

  const { addProject, deleteProject, setProject, getProjectsList} = useFirebase()

  const INITIAL_BILLING_RATE = {
    worker: '',
    rate: 1,
  }
  const INITIAL_EDIT_BILLING_RATE = {
    key: '',
    worker: '',
    rate: '',
  }
  const projects = useSelector(selectProjects)
  const [isFetchingProjecList, setIsFetchingProjecList] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingEdited, setIsSavingEdited] = useState(false)
  const [isDeletingBillingRate, setIsDeletingBillingRate] = useState('')
  const [editBillingRate, setEditBillingRate] = useState(INITIAL_EDIT_BILLING_RATE)
  const [isAddingBillingRate, setIsAddingBillingRate] = useState(false)
  const [selectedProject, setSelectedProject] = useState((projects && Object.keys(projects).length > 0) ? Object.keys(projects)[0] : 'add_new_project')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showConfirmBillingRate, setShowConfirmBillingRate] = useState(false)
  const [newBillingRate, setNewBillingRate] = useState(INITIAL_BILLING_RATE);


  const initialValues = {
    name: '',
    last_invoice_number: '',
    month_balance: '',
    monthly_invoice_address: '',
    week_balance: '',
    weekly_invoice_address: ''
  }
  const DisplayingErrorMessagesSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    last_invoice_number: Yup.string().required('Required').test('Digits Only', 'Invalid Number', value => /^\d+$/.test(value)),
    month_balance: Yup.string().required('Required').test('Digits Only', 'Invalid Number', value => /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(value)),
    week_balance: Yup.string().required('Required').test('Digits Only', 'Invalid Number', value => /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(value)),
    weekly_invoice_address: Yup.string().required('Required'),
    monthly_invoice_address: Yup.string().required('Required')
  });
  const dispatch = useDispatch()

  const updateProjectsList = () => {
    return getProjectsList().then(r => {
      const projects = r.docs.reduce((_projects, doc) => ({
        ..._projects,
        [doc.id]: doc.data(),
      }), {})
      dispatch(storeProjects(projects))

    })
  }

  useEffect(() => {
    updateProjectsList().then(() => setIsFetchingProjecList(false))
  },[])

  useEffect(() => {
    if (!Object.keys(projects).includes(selectedProject)) {
      setSelectedProject((projects && Object.keys(projects).length > 0) ? Object.keys(projects)[0] : 'add_new_project')
    }
  }, [projects])

  useEffect(() => {
    const project = projects[selectedProject]
    if (project) {
      formik.setValues({
        name: project.name || '',
        last_invoice_number: project.last_invoice_number || '',
        month_balance: project.month_balance || '',
        monthly_invoice_address: project.monthly_invoice_address || '',
        week_balance: project.week_balance || '',
        weekly_invoice_address: project.weekly_invoice_address || ''
      })
    } else {
      formik.setValues(initialValues)
      formik.resetForm()
    }
  }, [selectedProject])

  const onSubmit = () => {
    if (formik.isValid) {
      formik.submitForm()
    } else {
      alert('Fill all fields!')
    }
  }

  const onSubmitProjectForm = (values) => {
    formik.setSubmitting(true)
    if (selectedProject) {
      if (selectedProject === 'add_new_project') {
        addProject(values).then((r) => updateProjectsList().then(() => {
          alert('Project Added Successfully')
          formik.setSubmitting(false)
        })).catch(() => alert('Something went wrong'))

      } else {
        setProject(selectedProject, values).then(r => updateProjectsList().then(() => {
          alert('Project updated successfully')
          formik.setSubmitting(false)
        })).catch(() => alert('Something went wrong'))
      }
    }
  }
  const formik = useFormik({
    initialValues,
    validationSchema: DisplayingErrorMessagesSchema,
    onSubmit: onSubmitProjectForm
  })

  const renderError = (key) => {
    if (formik.touched[key] && formik.errors[key]) {
      return <div style={{ margin: '10px 0px', color: '#9f3a38'}}>{formik.errors[key]}</div>
    }
  }

  const onItemClick = (key) => {
    setSelectedProject(key)
  }
  const onDeleteProject = () => {
    setIsDeleting(true)
    deleteProject(selectedProject).then((r) => updateProjectsList().then(() => {
      alert('Project Deleted successfully')
      setIsDeleting(false)
    })).catch(() => alert('Something went wrong'))
  }

  const updateProjectDocument = () => {
    setIsAddingBillingRate(true)
    setProject(selectedProject, {
      ...projects[selectedProject], billing_rate: {
        ...(projects[selectedProject]?.billing_rate || []),
        [newBillingRate.worker]: newBillingRate.rate
      }
    }).then(r => updateProjectsList().then(() => {
      setNewBillingRate(INITIAL_BILLING_RATE)
      setIsAddingBillingRate(false)
      alert('Added successfully')
    })).catch(() => alert('Something went wrong'))
  }

  const updateBillingRate = () => {
    setIsSavingEdited(true)
    let updatedBillingRate = { ...projects[selectedProject]?.billing_rate }
    delete updatedBillingRate[editBillingRate.key]
    updatedBillingRate = {
      ...updatedBillingRate,
      [editBillingRate.worker] : editBillingRate.rate
    }
    setProject(selectedProject, {
      ...projects[selectedProject],
      billing_rate: updatedBillingRate
    }).then(r => updateProjectsList().then(() => {
      setEditBillingRate(INITIAL_EDIT_BILLING_RATE)
      setIsSavingEdited(false)
      alert('Updated successfully')
    })).catch(() => alert('Something went wrong'))
  }

  const onDeleteBillingDate = (key) => {
    let updatedBillingRate = { ...projects[selectedProject]?.billing_rate }
    delete updatedBillingRate[isDeletingBillingRate]
    setProject(selectedProject, {
      ...projects[selectedProject],
      billing_rate: updatedBillingRate
    }).then(r => updateProjectsList().then(() => {
      setIsDeletingBillingRate('')
      alert('Deleted successfully')
    })).catch(() => alert('Something went wrong'))
  }

  return (
    <>
    <Header />
      <div style={{ margin: 40 }}>
        {selectedProject && selectedProject !== 'add_new_project' && <Confirm
          open={showConfirm}
          cancelButton='No'
          confirmButton={<Button negative children='Yes' />}
          content={`Are you sure you want to delete "${projects[selectedProject]?.name || ''}"?`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            onDeleteProject()
          }}
        />}
        {selectedProject && selectedProject !== 'add_new_project' && <Confirm
          open={showConfirmBillingRate}
          cancelButton='No'
          confirmButton={<Button negative children='Yes' />}
          content={`Are you sure you want to delete?`}
          onCancel={() => {
            setIsDeletingBillingRate('')
            setShowConfirmBillingRate(false)
          }}
          onConfirm={() => {
            setShowConfirmBillingRate(false);
            onDeleteBillingDate()
          }}
        />}
        <Grid>
          {isFetchingProjecList ? (
            <div style={{ minHeight: 300 }}>
              <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
              </Dimmer>
            </div>
          ) : (
              <>
                <Grid.Column mobile={16} tablet={5} computer={5}>
                  <List selection verticalAlign='middle'>
                    {Object.keys(projects).map(key => {
                      const project = projects[key];
                      return (
                        <List.Item active={(selectedProject === key)} onClick={() => onItemClick(key)} key={key}>
                          <List.Content>
                            <List.Header>{project.name}</List.Header>
                          </List.Content>
                        </List.Item>
                      )
                    })}
                    <List.Item active={(selectedProject === 'add_new_project')} onClick={() => onItemClick('add_new_project')} >
                      <List.Content>
                        <List.Header>Add New Project</List.Header>
                      </List.Content>
                    </List.Item>
                  </List>

                </Grid.Column>
                <Grid.Column mobile={16} tablet={11} computer={11}>
                  <h3>Project Info</h3>
                  <Form>
                    <Form.Field error={formik.touched.name && formik.errors.name}>
                      <label>Project Name</label>
                      <Input type='text' placeholder='Project name'>
                        <input id='name' name='name' onChange={formik.handleChange} value={formik.values.name} onBlur={formik.handleBlur} />
                      </Input>
                      {renderError('name')}
                    </Form.Field>
                    <Form.Field onBlur={formik.handleBlur} error={formik.touched.last_invoice_number && formik.touched.last_invoice_number && formik.errors.last_invoice_number}>
                      <label>Last Invoice Number</label>
                      <Input labelPosition='left' type='text' placeholder='Invoice number'>
                        <Label basic>#</Label>
                        <input id='last_invoice_number' name='last_invoice_number' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.last_invoice_number} />
                      </Input>
                      {renderError('last_invoice_number')}
                    </Form.Field>
                    <Form.Field error={formik.touched.week_balance && formik.errors.week_balance}>
                      <label>Week Balance</label>
                      <Input labelPosition='left' type='text' placeholder='Amount'>
                        <Label basic>$</Label>
                        <input id='week_balance' name='week_balance' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.week_balance} />
                      </Input>
                      {renderError('week_balance')}
                    </Form.Field>
                    <Form.Field error={formik.touched.month_balance && formik.errors.month_balance}>
                      <label>Month Balance</label>
                      <Input labelPosition='left' type='text' placeholder='Amount'>
                        <Label basic>$</Label>
                        <input onBlur={formik.handleBlur} id='month_balance' name='month_balance' onChange={formik.handleChange} value={formik.values.month_balance} />
                      </Input>
                      {renderError('month_balance')}
                    </Form.Field>
                    <Form.TextArea id='weekly_invoice_address' onBlur={formik.handleBlur} error={formik.touched.weekly_invoice_address && formik.errors.weekly_invoice_address} onChange={(e, { value }) => formik.setFieldValue('weekly_invoice_address', value)} label='Address ( Weekly Invoice )' placeholder='enter the address' value={formik.values.weekly_invoice_address} />
                    <Form.TextArea id='monthly_invoice_address' onBlur={formik.handleBlur} error={formik.touched.monthly_invoice_address && formik.errors.monthly_invoice_address} onChange={(e, { value }) => formik.setFieldValue('monthly_invoice_address', value)} value={formik.values.monthly_invoice_address} label='Address ( Monthly Invoice )' placeholder='enter the address' />
                    <Button loading={formik.isSubmitting} onClick={onSubmit} color='blue' type='submit'>{(selectedProject === 'add_new_project') ? 'Add' : 'Update'}</Button>
                    {(selectedProject !== 'add_new_project') && (
                      <Button loading={isDeleting} onClick={() => setShowConfirm(true)} negative type='submit'>Delete</Button>
                    )}
                  </Form>
                  <br />
                  {
                    selectedProject !== 'add_new_project' && (
                    <>  <hr />
                  <h3>Default Billing Rates</h3>
                  <Table celled>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Worker</Table.HeaderCell>
                        <Table.HeaderCell>Rate</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {(!!!projects[selectedProject]?.billing_rate || projects[selectedProject]?.billing_rate?.length <= 0) ? (<Table.Row textAlign='center' warning><Table.Cell colSpan='3'><Icon name='attention' />Nothing Found!</Table.Cell></Table.Row>) :
                        Object.keys(projects[selectedProject].billing_rate).map((key) => (
                          <Table.Row>
                            <Table.Cell>{editBillingRate.key === key ? (
                              <Input style={{ width: '100%' }} error={false} type='text' placeholder='Worker'>
                                <input autoFocus value={editBillingRate.worker} onChange={(e) => {
                                  setEditBillingRate({
                                    ...editBillingRate,
                                    worker: e.target.value
                                  })
                                }} />
                              </Input>
                            ) : key}</Table.Cell>
                            <Table.Cell>{
                              editBillingRate.key === key
                                ? (
                                  <Dropdown
                                    search
                                    onChange={(e, data) => {
                                      setEditBillingRate({
                                        ...editBillingRate,
                                        rate: Number(data.value)
                                      })
                                    }}
                                    fluid
                                    value={editBillingRate.rate.toFixed(2)}
                                    selection
                                    options={getNumbersInRangeAsArray(1, 25, 0.01).map((number) => ({
                                      key: number.toFixed(2),
                                      value: number.toFixed(2),
                                      text: '$' + number.toFixed(2)
                                    }))}
                                  />
                                )
                                : projects[selectedProject].billing_rate[key].toFixed(2)
                            }</Table.Cell>
                            <Table.Cell>
                              <Button loading={isDeletingBillingRate === key} icon={editBillingRate.key === key ? 'cancel' : 'trash'} onClick={() => {
                                if (editBillingRate.key === key) {
                                  setEditBillingRate(INITIAL_EDIT_BILLING_RATE)
                                } else {
                                  setIsDeletingBillingRate(key)
                                  setShowConfirmBillingRate(true)
                                }
                              }} negative />
                              <Button loading={editBillingRate.key === key && isSavingEdited} icon={editBillingRate.key === key ? 'save' : 'pencil alternative'} onClick={() => {
                                if (editBillingRate.key === key) {
                                  updateBillingRate()
                                } {
                                  setEditBillingRate({
                                    ...editBillingRate,
                                    key,
                                    worker: key,
                                    rate: projects[selectedProject].billing_rate[key]
                                  })
                                }
                              }} positive />
                            </Table.Cell>
                          </Table.Row>)
                        )
                      }
                      <Table.Row>
                        <Table.Cell>
                          <Form.Field>
                            <Input style={{ width: '100%' }} type='text' placeholder='Worker'>
                              <input value={newBillingRate.worker} onChange={(e) => {
                                setNewBillingRate({
                                  ...newBillingRate,
                                  worker: e.target.value
                                })
                              }} />
                            </Input>
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Dropdown
                            search
                            onChange={(e, data) => {
                              setNewBillingRate({
                                ...newBillingRate,
                                rate: Number(data.value)
                              })
                            }}
                            fluid
                            value={newBillingRate.rate.toFixed(2)}
                            selection
                            options={getNumbersInRangeAsArray(1, 25, 0.01).map((number) => ({
                              key: number.toFixed(2),
                              value: number.toFixed(2),
                              text: '$' + number.toFixed(2)
                            }))}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Button loading={isAddingBillingRate} onClick={updateProjectDocument}>Add</Button>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table></>
                    )
                  }
                </Grid.Column>
              </>
            )}
        </Grid>
      </div>
    </>
  )
}

//<Table.Cell><Button onClick={() => deleteWorkerData(name) } icon='trash' /></Table.Cell>