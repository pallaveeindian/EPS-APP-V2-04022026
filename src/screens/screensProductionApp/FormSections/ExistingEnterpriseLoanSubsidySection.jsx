// src/screens/screensProductionApp/FormSections/ExistingEnterpriseLoanSubsidySection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const YES_NO = ['Yes', 'No'];

/**
 * Parent–child tree for loan/subsidy institutions and schemes
 * Reuses the same structure you specified for sources.
 */
const INSTITUTION_SCHEME_TREE = [
  {
    parent: 'MSME / Industry Department',
    children: [
      'UP MSME Promotion Policy 2022',
      'ODOP (One District One Product)',
      'Vishwakarma Shram Samman Yojana',
      'Chief Minister Youth Entrepreneur Development Campaign',
      'Micro-food Industries Promotion',
      'Capital Subsidy Scheme',
    ],
  },
  {
    parent: 'Women Welfare / Women Empowerment Department',
    children: ['Mahila Samarthya Yojana'],
  },
  {
    parent: 'Village Industries / Khadi and Village Industries Department',
    children: [
      'Khadi & Village Industries (KVIC UP) Loan Assistance',
      'Margin Money Scheme',
    ],
  },
  {
    parent: 'Agriculture / Animal Husbandry Department',
    children: [
      'Kamdhenu Dairy Yojana',
      'UP Food Processing Industry Support',
    ],
  },
  {
    parent: 'Department of Social Welfare',
    children: ['PM AJAY'],
  },
  {
    parent: 'Department of Fisheries',
    children: ['Chief Minister Matsya Sampada Yojana'],
  },
  {
    parent: 'OBC Finance Development Corporation',
    children: ['Self-employment loans'],
  },
  {
    parent: 'NABARD Schemes for SHGs & Rural Enterprises',
    children: [
      'Micro Enterprise Development Programme (MEDP)',
      'Livelihood Enterprise Development Programme (LEDP)',
      'Grant for capability building',
      'Loan refinancing',
    ],
  },
  {
    parent: 'Central Government Schemes (Also including NABARD)',
    children: [
      'Micro Enterprise Development Programme (MEDP)',
      'Livelihood Enterprise Development Programme (LEDP)',
      'Grant for capability building',
      'Loan refinancing',
    ],
  },
  {
    parent: 'Other Schemes',
    children: [
      'Mudra Loan (for women entrepreneurs)',
      'Stand-Up India (women SC/ST entrepreneurs)',
      'ZED (Zero Defect Zero Effect) – Women MSME',
      'Women Entrepreneurship Fund / Scheme',
      'Coir Vikas Yojana',
      'Prime Minister Employment Generation Programme (PMEGP)',
      'PM SVANidhi',
      'SHG-Bank Linkage',
      'PM-FME (PM Formalization of Micro Food Processing Enterprises)',
      'Dairy Entrepreneur Development Scheme',
      'Prime Minister Matsya Sampada Yojana',
      'PMFME (Micro Food Processing)',
      'SFURTI (Scheme of Fund for Regeneration of Traditional Industries)',
      'ASPIRE (A Scheme for Promotion of Innovation, Rural Industry and Entrepreneurship)',
      'AGEY',
      'SVEP',
      'PMFME',
      'PATB',
    ],
  },
  {
    parent: 'Others (Specify)',
    children: ['Others'],
  },
];

const SUBSIDY_TYPE_OPTIONS = [
  'Direct',
  'Indirect',
  'Cross',
  'Targeted',
  'Others',
];

const REPAYMENT_STATUS_OPTIONS = [
  'Regular / On time',
  'Partially paid',
  'Not yet started',
  'Fully repaid',
  'Default / Irregular',
  'Others',
];

const YesNoToggle = ({ value, onChange }) => (
  <View style={styles.yesNoRow}>
    {YES_NO.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[
          styles.yesNoBtn,
          value === opt && styles.yesNoBtnActive,
        ]}
        onPress={() => onChange(opt)}
      >
        <Text
          style={[
            styles.yesNoText,
            value === opt && styles.yesNoTextActive,
          ]}
        >
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const InstitutionTree = ({ value, onChange }) => {
  const selectedTree = Array.isArray(value) ? value : [];

  const isParentSelected = (parent) =>
    !!selectedTree.find((row) => row.parent === parent);

  const isChildSelected = (parent, child) => {
    const row = selectedTree.find((r) => r.parent === parent);
    return !!row && row.children?.includes(child);
  };

  const toggleParent = (parent) => {
    const exists = selectedTree.find((row) => row.parent === parent);
    let updated;
    if (exists) {
      updated = selectedTree.filter((row) => row.parent !== parent);
    } else {
      updated = [...selectedTree, { parent, children: [] }];
    }
    onChange(updated);
  };

  const toggleChild = (parent, child) => {
    const existing = selectedTree.find((row) => row.parent === parent);
    let updated = [...selectedTree];
    if (!existing) {
      updated.push({ parent, children: [child] });
    } else {
      const children = existing.children || [];
      const has = children.includes(child);
      const newChildren = has
        ? children.filter((c) => c !== child)
        : [...children, child];
      updated = updated.map((row) =>
        row.parent === parent ? { ...row, children: newChildren } : row
      );
    }
    onChange(updated);
  };

  return (
    <View style={{ marginTop: 8 }}>
      {INSTITUTION_SCHEME_TREE.map((group) => {
        const parentSelected = isParentSelected(group.parent);
        return (
          <View key={group.parent} style={styles.treeGroup}>
            <TouchableOpacity
              onPress={() => toggleParent(group.parent)}
              style={styles.treeParentRow}
            >
              <Text style={styles.treeParentText}>{group.parent}</Text>
              <Text>{parentSelected ? '☑' : '☐'}</Text>
            </TouchableOpacity>

            {parentSelected && (
              <View style={styles.treeChildrenBlock}>
                {group.children.map((child) => (
                  <TouchableOpacity
                    key={child}
                    style={styles.treeChildRow}
                    onPress={() => toggleChild(group.parent, child)}
                  >
                    <Text style={styles.treeChildCheckbox}>
                      {isChildSelected(group.parent, child) ? '☑' : '☐'}
                    </Text>
                    <Text style={styles.treeChildLabel}>{child}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const computeTreeTitle = (tree, fallback) => {
  if (!Array.isArray(tree) || tree.length === 0) return fallback;
  const firstParent = tree[0]?.parent;
  if (!firstParent) return fallback;
  return firstParent;
};

export default function ExistingEnterpriseLoanSubsidySection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);

  const loans = Array.isArray(existingForm.loans) ? existingForm.loans : [];
  const subsidies = Array.isArray(existingForm.subsidies)
    ? existingForm.subsidies
    : [];

  const hasLoanYes = existingForm.has_taken_loan === 'Yes';
  const hasSubsidyYes = existingForm.has_receieved_subsidy === 'Yes';

  const updateLoans = (next) => update({ loans: next });
  const updateSubsidies = (next) => update({ subsidies: next });

  const addLoanRow = () => {
    const newRow = {
      id: Date.now().toString(),
      title: 'New Loan',
      expanded: true,
      institution_tree: [],
      loan_amount: '',
      date_taken: '',
      repayment_status: '',
      repayment_status_other: '',
    };
    updateLoans([...loans, newRow]);
  };

  const removeLoanRow = (index) => {
    const next = loans.filter((_, i) => i !== index);
    updateLoans(next);
  };

  const updateLoanRow = (index, patch) => {
    const next = loans.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateLoans(next);
  };

  const toggleLoanExpand = (index) => {
    const row = loans[index];
    updateLoanRow(index, { expanded: !row.expanded });
  };

  const addSubsidyRow = () => {
    const newRow = {
      id: Date.now().toString(),
      title: 'New Subsidy',
      expanded: true,
      subsidy_type: '',
      subsidy_type_other: '',
      subsidy_name_tree: [],
      subsidy_detail: '',
    };
    updateSubsidies([...subsidies, newRow]);
  };

  const removeSubsidyRow = (index) => {
    const next = subsidies.filter((_, i) => i !== index);
    updateSubsidies(next);
  };

  const updateSubsidyRow = (index, patch) => {
    const next = subsidies.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateSubsidies(next);
  };

  const toggleSubsidyExpand = (index) => {
    const row = subsidies[index];
    updateSubsidyRow(index, { expanded: !row.expanded });
  };

  const bankOptions = [
  { label: "State Bank of India (SBI)", value: "SBI" },
  { label: "Punjab National Bank (PNB)", value: "PNB" },
  { label: "Bank of Baroda (BoB)", value: "BOB" },
  { label: "Canara Bank", value: "CANARA" },
  { label: "Central Bank of India", value: "CBI" },
  { label: "Indian Bank", value: "INDIAN_BANK" },
  { label: "Indian Overseas Bank", value: "IOB" },
  { label: "UCO Bank", value: "UCO" },
  { label: "Union Bank of India", value: "UNION" },

  { label: "HDFC Bank", value: "HDFC" },
  { label: "ICICI Bank", value: "ICICI" },
  { label: "Axis Bank", value: "AXIS" },
  { label: "Kotak Mahindra Bank", value: "KOTAK" },
  { label: "IndusInd Bank", value: "INDUSIND" },
  { label: "YES Bank", value: "YES" },

  { label: "Prathama Bank", value: "PRATHAMA" },
  { label: "Allahabad UP Gramin Bank", value: "AUPGB" },

  { label: "District Central Cooperative Bank", value: "DCCB" },
  { label: "Urban Cooperative Bank", value: "UCB" },
  { label: "Rajdhani Nagar Sahkari Bank", value: "RNSB" },

  { label: "Other (Specify)", value: "OTHER" },
];


  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>5) Loan and Subsidy Details</Text>

      {/* 19) Has taken loan? */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Have you taken any Loans after your Initial Investment?
        </Text>
        <Text style={styles.helpText}>
          Please select Yes if you have taken any loan (from bank, government scheme,
          institution, etc.) for this enterprise after your first investment.
        </Text>
        <YesNoToggle
          value={existingForm.has_taken_loan || ''}
          onChange={(val) => update({ has_taken_loan: val })}
        />
      </View>

      {/* Loan rows */}
      {hasLoanYes && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.helpText, { marginBottom: 8 }]}>
            You can add details of each loan separately. Please click &quot;+ Add Loan&quot; to record another loan.
          </Text>

          {loans.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              {/* Header */}
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleLoanExpand(index)}
              >
                <Text style={styles.cardTitle}>{row.title || 'New Loan'}</Text>
                <Text style={styles.cardToggle}>{row.expanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeLoanRow(index)}
                >
                  <Text style={styles.removeBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                  {/* 1) Institution tree */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Specify the Institution from where you took the Loan
                    </Text>
                    <Text style={styles.helpText}>
                      Please select all relevant departments and schemes from where you received this loan.
                      First tick the department, then choose the specific schemes under it.
                    </Text>

                    <InstitutionTree
                      value={row.institution_tree}
                      onChange={(tree) =>
                        updateLoanRow(index, {
                          institution_tree: tree,
                          title: computeTreeTitle(tree, 'New Loan'),
                        })
                      }
                    />
{/* 
                    <Text style={[styles.helpText, { marginTop: 4 }]}>
                      Your selections will be saved like
                      &nbsp;&quot;[Department: Scheme1, Scheme2]&quot; for the server.
                    </Text> */}
                  </View>
                   
                   {/* 4) Bank Details */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>
    From which bank have you taken the loan?
  </Text>

  {bankOptions.map(bank => (
    <TouchableOpacity
      key={bank.value}
      style={styles.checkboxRow}
      onPress={() => updateLoanRow(index, { bank_name: bank.value })}
    >
      <View style={styles.checkbox}>
        {row.bank_name === bank.value && <View style={styles.checkboxFill} />}
      </View>

      <Text>{bank.label}</Text>
    </TouchableOpacity>
  ))}

  {/* OTHER FIELD */}
  {row.bank_name === 'OTHER' && (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.helpText}>Please specify the bank name</Text>
      <TextInput
        style={styles.input}
        value={row.other_bank_name || ''}
        onChangeText={(v) => updateLoanRow(index, { other_bank_name: v })}
      />
    </View>
  )}

  {/* BRANCH FIELD */}
  {!!row.bank_name && (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.helpText}>Enter Branch Name</Text>
      <TextInput
        style={styles.input}
        value={row.branch_name || ''}
        onChangeText={(v) => updateLoanRow(index, { branch_name: v })}
      />
    </View>
  )}
</View>

                  
                  {/*  Loan amount */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Specify the Amount of Loan
                    </Text>
                    <Text style={styles.helpText}>
                      Please enter the loan amount sanctioned for this particular loan (in rupees).
                    </Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={row.loan_amount || ''}
                      onChangeText={(v) => updateLoanRow(index, { loan_amount: v })}
                    />
                  </View>

                  {/*  Repayment Details */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>
    How much have you repaid?
  </Text>

  <TextInput
    style={styles.input}
    keyboardType="numeric"
    value={row.repaid_amount || ''}
    onChangeText={(v) => updateLoanRow(index, { repaid_amount: v })}
  />

  {/* Pending Amount */}
  {(() => {
    const loan = Number(row.loan_amount) || 0;
    const repaid = Number(row.repaid_amount) || 0;
    const pending = loan - repaid;

    return (
      <View style={{ marginTop: 8 }}>
        <Text style={styles.helpText}>Pending Amount: {pending}</Text>

        {/* Repayment Status */}
        {(() => {
          let status = '';
          let color = 'black';

          if (repaid === 0) {
            status = 'Fully Pending';
            color = 'red';
          } else if (pending === 0) {
            status = 'Fully Paid';
            color = 'green';
          } else if (pending > 0) {
            status = 'Partially Paid';
            color = 'gold';
          } else if (pending < 0) {
            status = `Overpaid by ${Math.abs(pending)}`;
            color = 'red';
          }

          // Validation: repayment must not exceed loan
          const showError = repaid > loan;

          return (
            <>
              <Text style={{ color, fontWeight: 'bold', marginTop: 6 }}>
                Repayment Status: {status}
              </Text>

              {showError && (
                <Text style={{ color: 'red' }}>
                  Error: Repayment cannot exceed loan amount
                </Text>
              )}
            </>
          );
        })()}
      </View>
    );
  })()}
</View>

                  {/*  Date taken */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Specify the Date on which you took the Loan
                    </Text>
                    <Text style={styles.helpText}>
                      Please enter the date when the loan was sanctioned or first disbursed.
                      You may use the format YYYY-MM-DD (for example, 2024-01-15).
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      value={row.date_taken || ''}
                      onChangeText={(v) => updateLoanRow(index, { date_taken: v })}
                    />
                  </View>

                  {/* 4) Repayment status */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      4) Repayment Status
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the option that best describes your present repayment status for this loan.
                    </Text>
                    <View style={styles.chipRow}>
                      {REPAYMENT_STATUS_OPTIONS.map((opt) => {
                        const active = row.repayment_status === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.chip,
                              active && styles.chipActive,
                            ]}
                            onPress={() =>
                              updateLoanRow(index, { repayment_status: opt })
                            }
                          >
                            <Text
                              style={[
                                styles.chipText,
                                active && styles.chipTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {row.repayment_status === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify other repayment status"
                        value={row.repayment_status_other || ''}
                        onChangeText={(v) =>
                          updateLoanRow(index, { repayment_status_other: v })
                        }
                      />
                    )}
                  </View> */}
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addLoanRow}>
            <Text style={styles.addBtnText}>+ Add Loan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 20) Has received subsidy? */}
      <View style={[styles.fieldBlock, { marginTop: 18 }]}>
        <Text style={styles.label}>
          Have you received any Government Subsidies?
        </Text>
        <Text style={styles.helpText}>
          Please select Yes if you have received any subsidy support for this enterprise
          from any department or scheme.
        </Text>
        <YesNoToggle
          value={existingForm.has_receieved_subsidy || ''}
          onChange={(val) => update({ has_receieved_subsidy: val })}
        />
      </View>

      {/* Subsidy rows */}
      {hasSubsidyYes && (
        <View style={{ marginTop: 8 }}>
          {/* <Text style={[styles.helpText, { marginBottom: 8 }]}>
            You can record each subsidy separately. Please click &quot;+ Add Subsidy&quot; to add another subsidy detail.
          </Text> */}

          {subsidies.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleSubsidyExpand(index)}
              >
                <Text style={styles.cardTitle}>
                  {row.title || 'New Subsidy'}
                </Text>
                <Text style={styles.cardToggle}>
                  {row.expanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeSubsidyRow(index)}
                >
                  <Text style={styles.removeBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                  {/* 1) Subsidy type */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      1) What is the type of Subsidy you took?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the nature of subsidy (for example, if it is directly
                      given to you, or indirectly through another support).
                    </Text>
                    <View style={styles.chipRow}>
                      {SUBSIDY_TYPE_OPTIONS.map((opt) => {
                        const active = row.subsidy_type === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.chip,
                              active && styles.chipActive,
                            ]}
                            onPress={() =>
                              updateSubsidyRow(index, { subsidy_type: opt })
                            }
                          >
                            <Text
                              style={[
                                styles.chipText,
                                active && styles.chipTextActive,
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {row.subsidy_type === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify subsidy type"
                        value={row.subsidy_type_other || ''}
                        onChangeText={(v) =>
                          updateSubsidyRow(index, { subsidy_type_other: v })
                        }
                      />
                    )}
                  </View> */}

                  {/* 2) Institution / scheme tree */}
                  <View className={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Specify the Institution from where you received the Subsidy
                    </Text>
                    <Text style={styles.helpText}>
                      Please select all relevant departments and schemes that provided this subsidy.
                    </Text>

                    <InstitutionTree
                      value={row.subsidy_name_tree}
                      onChange={(tree) =>
                        updateSubsidyRow(index, {
                          subsidy_name_tree: tree,
                          title: computeTreeTitle(tree, 'New Subsidy'),
                        })
                      }
                    />

                    {/* <Text style={[styles.helpText, { marginTop: 4 }]}>
                      Your selections will be saved as &quot;[Department: Scheme1, Scheme2]&quot;
                      format for sending to the server.
                    </Text> */}
                  </View>

                  {/* 3) Subsidy amount / detail */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      What was the amount or detail of the subsidy you received?
                    </Text>
                    <Text style={styles.helpText}>
                      Please mention the amount in rupees (if known) and any important details
                      (like year, nature of support, etc.).
                    </Text>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                      multiline
                      value={row.subsidy_detail || ''}
                      onChangeText={(v) =>
                        updateSubsidyRow(index, { subsidy_detail: v })
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addSubsidyRow}>
            <Text style={styles.addBtnText}>+ Add Subsidy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  yesNoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  yesNoBtnActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  yesNoText: {
    fontSize: 14,
    color: '#333',
  },
  yesNoTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fafafa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  cardToggle: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardBody: {
    marginTop: 8,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f3d0d0',
    borderRadius: 6,
  },
  removeBtnText: {
    fontSize: 12,
    color: '#a03333',
    fontWeight: '600',
  },
  treeGroup: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  treeParentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  treeParentText: {
    fontWeight: '600',
    flex: 1,
  },
  treeChildrenBlock: {
    marginTop: 8,
    paddingLeft: 8,
  },
  treeChildRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  treeChildCheckbox: {
    width: 20,
    fontSize: 16,
  },
  treeChildLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  addBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2b7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#2b7',
    fontWeight: '700',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: {
    backgroundColor: '#EE6969',
    borderColor: '#EE6969',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
    input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
  helpText: {
    color: '#666',
  },
  checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 6,
},
checkbox: {
  width: 20,
  height: 20,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#666',
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
checkboxFill: {
  width: 12,
  height: 12,
  backgroundColor: '#d9534f',
  borderRadius: 2,
},
});
