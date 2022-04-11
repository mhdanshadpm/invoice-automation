import { Document, Paragraph, TextRun, Table as TableDocx, TableCell as TableCellDocx, TableRow as TableRowDocx, WidthType, AlignmentType, VerticalAlign } from "docx";
import moment from 'moment';
import { numberWithCommas } from "../../utils/functions";

export const create = (state, invoiceData, invoiceTableColumns, billingDate, bucket, totalPayable, showCardColumns) => {
  const TABLE_MARGIN = {
    bottom: 100,
    top: 100,
    left: 100,
    right: 100
  };
  const DOC_FONT = 'Arial';
  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 800,
              bottom: 800,
              left: 800,
              right: 800
            },
            size: {
              width: 12240,
              height: 15840
            }
          }
        },
        children: [
          ...state.invoiceMode === 'week' ? [
            new Paragraph({
              children: [
                new TextRun({
                  bold: true,
                  font: DOC_FONT,
                  text: `Invoice #${state.invoiceNumber}`,
                  size: 36
                })
              ],
            }),
            new Paragraph(""),
            new Paragraph({
              indent: {
                start: 0,
                hanging: 0
              },
              children: [
                new TextRun({
                  bold: true,
                  font: DOC_FONT,
                  text: `Period: ${moment(state.dates[0]).format('MMMM D ,YYYY ')} through ${moment(state.dates[1]).format('MMMM D ,YYYY ')}`,
                  size: 36
                })
              ],
            }),
          ] : [
              new Paragraph({
                children: [
                  new TextRun({
                    bold: true,
                    font: DOC_FONT,
                    text: `Invoice #${state.invoiceNumber} - ${moment(state.dates[0]).format('MMMM').toUpperCase()} ${moment(state.dates[0]).format('YYYY')}`,
                    size: 36
                  })
                ],
              }),
            ],
          new Paragraph(""),
          new Paragraph(""),
          new TableDocx({
            columnWidths: [5300, 5300],
            margins: TABLE_MARGIN,
            rows: [
              new TableRowDocx({
                tableHeader: true,
                children: [
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        font: DOC_FONT,
                        text: `Billing Period:  ${moment(state.dates[0]).format('Do')} to ${moment(state.dates[1]).format('Do')} ${moment(state.dates[0]).format('MMMM YYYY')}`,
                        bold: true,
                      })]
                    })],
                  }),
                  new TableCellDocx({
                    verticalAlign: 'center',
                    children: [new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({
                        font: DOC_FONT,
                        text: `Invoice Date: ${moment(billingDate).format('DD-MM-YYYY')}`,
                        bold: true,
                      })]
                    })],
                  }),
                ],
              }),
            ]
          }),
          new Paragraph(""),
          new TableDocx({
            columnWidths: [5300, 5300],
            margins: TABLE_MARGIN,
            rows: [
              new TableRowDocx({
                tableHeader: true,
                height: { value: 500 },
                children: [
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        font: DOC_FONT,
                        text: 'From',
                        bold: true,
                      })]
                    })],
                  }),
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        font: DOC_FONT,
                        text: 'To',
                        bold: true,
                      })]
                    })],
                  }),
                ],
              }),
              new TableRowDocx({
                children: [
                  new TableCellDocx({
                    children: state.from.split('\n').map(string => new Paragraph({ children: [new TextRun({ text: string, font: DOC_FONT, })] })),
                  }),
                  new TableCellDocx({
                    children: state.to.split('\n').map(string => new Paragraph({ children: [new TextRun({ text: string, font: DOC_FONT, })] })),
                  }),
                ],
              }),
            ],
          }),
          new Paragraph(""),
          new TableDocx({
            columnWidths: [2700, 7900],
            margins: TABLE_MARGIN,
            rows: [
              new TableRowDocx({
                tableHeader: true,
                height: { value: 500 },
                children: [
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: `Starting ${state?.invoiceMode === 'week' ? 'week' : 'monthly'} balance`,
                        bold: true,
                        font: DOC_FONT
                      })],
                    })],
                  }),
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: '$ ' + numberWithCommas(Number(state.startBalance).toFixed(2)),
                        font: DOC_FONT
                      })],
                    })],
                  }),
                ],
              }),
              new TableRowDocx({
                children: [
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: `Ending ${state?.invoiceMode === 'week' ? 'week' : 'monthly'} balance`,
                        bold: true,
                        font: DOC_FONT
                      })],
                    })],
                  }),
                  new TableCellDocx({
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: '$ ' + numberWithCommas(Number(state.endBalance).toFixed(2)),
                        font: DOC_FONT
                      })],
                    })],
                  }),
                ],
              }),

            ],
          }),
          new Paragraph({
            spacing: { line: 500 },
            children: [new TextRun("Work Log - "), new TextRun({
              text: state.project.name,
              bold: true,
              font: DOC_FONT
            })],
          }),
          new Paragraph(""),
          new TableDocx({
            width: {
              size: 10600,
              type: WidthType.DXA
            },
            columnWidths: [100, 931, ...(state.invoiceMode === 'week' ? [190] : []), 190, 190, 200, ...(showCardColumns ? [
              220, 250
            ] : [])],
            rows: [
              new TableRowDocx({
                tableHeader: true,
                children: [
                  new TableCellDocx({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            font: DOC_FONT,
                            text: '#',
                            bold: true
                          })
                        ]
                      })
                    ]
                  }),
                  ...invoiceTableColumns.map((item, index) => (
                    new TableCellDocx({
                      children: [
                        new Paragraph({
                          spacing: {
                            before: 100,
                            after: 100,
                          },
                          alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              font: DOC_FONT,
                              bold: true,
                              text: item.Header,
                            })
                          ]
                        })
                      ],
                    })))
                ]
              }),
              ...invoiceData.map((data, index) => (
                new TableRowDocx({
                  tableHeader: true,
                  children: [
                    new TableCellDocx({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              font: DOC_FONT,
                              text: index + 1,
                            })
                          ]
                        })
                      ]
                    }),
                    ...invoiceTableColumns.map((item, index) => (
                      new TableCellDocx({
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            spacing: {
                              before: 100,
                              after: 100,
                            },
                            alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                font: DOC_FONT,
                                text: data[item.accessor],
                              })
                            ]
                          })
                        ],
                      })))
                  ]
                })
              )),
              new TableRowDocx({
                tableHeader: true,
                children: [
                  new TableCellDocx({ children: [] }),
                  new TableCellDocx({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        spacing: {
                          before: 300,
                          after: 100,
                        },
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            bold: true,
                            font: DOC_FONT,
                            text: (state?.invoiceMode === 'week') ? 'Total' : 'Billed Total',
                          })
                        ]
                      })
                    ],
                  }),
                  ...(state?.invoiceMode === 'week') ? [
                    new TableCellDocx({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: state.total.hoursWorked,
                              bold: true,
                              font: DOC_FONT
                            })
                          ]
                        })
                      ]
                    })
                  ] : [],
                  new TableCellDocx({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: state.total.hoursBilled,
                            bold: true,
                            font: DOC_FONT
                          })
                        ]
                      })
                    ]
                  }),
                  new TableCellDocx({ children: [] }),
                  new TableCellDocx({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: `$ ${numberWithCommas(parseFloat(state.total.usd).toFixed(2))}`,
                            bold: true,
                            font: DOC_FONT
                          })
                        ]
                      })
                    ]
                  }),
                  ...showCardColumns ? [
                    new TableCellDocx({ children: [] }),
                    new TableCellDocx({ children: [] }),
                  ] : []
                ]
              }),
              ...state?.invoiceMode === 'month' ? [
                {
                  label: `Total estimate for the month of ${moment(state.dates[0]).add(1, 'month').format('MMMM')}`,
                  value: `$ ${numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}`,
                },
                {
                  label: `${Number(state.endBalance) < 0 ? 'Unpaid' : 'Paid'}  bucket for ${moment(state.dates[0]).format('MMMM')}`,
                  value: numberWithCommas(bucket),
                },
                {
                  label: 'Total Payable',
                  value: `$ ${numberWithCommas(totalPayable)}`,
                },

              ].map(item => (
                new TableRowDocx({
                  tableHeader: true,
                  children: [
                    new TableCellDocx({ children: [] }),
                    new TableCellDocx({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          spacing: {
                            before: 80,
                            after: 80,
                          },
                          alignment: AlignmentType.LEFT,
                          children: [
                            new TextRun({
                              bold: true,
                              font: DOC_FONT,
                              text: item.label,
                            })
                          ]
                        })
                      ],
                    }),
                    new TableCellDocx({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: '-',
                              bold: true,
                              font: DOC_FONT
                            })
                          ]
                        })
                      ]
                    }),
                    new TableCellDocx({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: '-',
                              bold: true,
                              font: DOC_FONT
                            })
                          ]
                        })
                      ]
                    }),
                    new TableCellDocx({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: item.value,
                              bold: true,
                              font: DOC_FONT
                            })
                          ]
                        })
                      ]
                    }),
                    ...showCardColumns ? [
                      new TableCellDocx({ children: [] }),
                      new TableCellDocx({ children: [] }),
                    ] : []
                  ]
                })
              )) : []
            ],
          }),
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({
              text: `Amount due: $ ${(state.invoiceMode === 'week') ? '---' : numberWithCommas(totalPayable)}`,
              bold: true,
              font: DOC_FONT
            })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun("Account balance after payment: "), new TextRun({
              text: (state.invoiceMode === 'week') ? '---' : `$${numberWithCommas(Number(state.nextMonthEstimate).toFixed(2))}`,
              bold: true,
              font: DOC_FONT
            })],
          }),
        ]
      }
    ]
  });

  return document;
}