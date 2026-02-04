import React, { useState, useContext } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LanguageContext } from '../../components/LanguageContext';

// Section component (collapsible)
const Section = ({ title, children, openByDefault = false }) => {
  const [open, setOpen] = useState(openByDefault);
  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title} {open ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {open && <View style={{ padding: 10 }}>{children}</View>}
    </View>
  );
};

// Checkbox component
const Checkbox = ({ label, value, onChange }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={() => onChange(!value)}>
    <View style={[styles.checkbox, value && { backgroundColor: '#EE6969', borderColor: '#EE6969' }]} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function EnterpriseFormNew() {
  const { language } = useContext(LanguageContext);

  // Form state
  const [form, setForm] = useState({
    applicant_name: '', father_spouse_name: '', age: '', mobile_number: '', address: '', district: '', block: '', gram: '', shg_name: '', shg_membership: '',
    has_enterprise: '', enterprise_name: '', enterprise_type: '', year_establishment: '', type_business: '', monthly_income: '', employees: '', sales_area: '', past_scheme_support: '',
    interested_enterprise: '', interested_type: '', selected_location: '', received_training: '', training_detail: '',
    support_skill: false, support_training: false, support_finance: false, support_market: false, support_infra: false, support_digital: false, support_other: ''
  });

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    Alert.alert('Form Submitted', JSON.stringify(form, null, 2));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Section title="Basic Details" openByDefault>
        <Text style={styles.inputLabel}>Applicant Name</Text>
        <TextInput style={styles.input} value={form.applicant_name} onChangeText={v => setField('applicant_name', v)} />

        <Text style={styles.inputLabel}>Father/Spouse Name</Text>
        <TextInput style={styles.input} value={form.father_spouse_name} onChangeText={v => setField('father_spouse_name', v)} />

        <Text style={styles.inputLabel}>Age (Years)</Text>
        <TextInput style={styles.input} value={form.age} keyboardType="numeric" onChangeText={v => setField('age', v)} />

        <Text style={styles.inputLabel}>Mobile Number</Text>
        <TextInput style={styles.input} value={form.mobile_number} keyboardType="numeric" onChangeText={v => setField('mobile_number', v)} />

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput style={styles.input} value={form.address} onChangeText={v => setField('address', v)} multiline />

        <Text style={styles.inputLabel}>District</Text>
        <TextInput style={styles.input} value={form.district} onChangeText={v => setField('district', v)} />

        <Text style={styles.inputLabel}>Block</Text>
        <TextInput style={styles.input} value={form.block} onChangeText={v => setField('block', v)} />

        <Text style={styles.inputLabel}>Gram</Text>
        <TextInput style={styles.input} value={form.gram} onChangeText={v => setField('gram', v)} />

        <Text style={styles.inputLabel}>SHG/VO/CLF Name (if member)</Text>
        <TextInput style={styles.input} value={form.shg_name} onChangeText={v => setField('shg_name', v)} />

        <Text style={styles.inputLabel}>SHG Membership if any</Text>
        <TextInput style={styles.input} value={form.shg_membership} onChangeText={v => setField('shg_membership', v)} />
      </Section>

      <Section title="Enterprise Details">
        <Text style={styles.inputLabel}>Do you currently have an enterprise/business?</Text>
        <Picker
          style={styles.picker}
          selectedValue={form.has_enterprise}
          onValueChange={v => setField('has_enterprise', v)}
        >
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Yes" value="Yes" />
          <Picker.Item label="No" value="No" />
        </Picker>

        {form.has_enterprise === 'Yes' && (
          <>
            <Text style={styles.inputLabel}>Enterprise/Business Name</Text>
            <TextInput style={styles.input} value={form.enterprise_name} onChangeText={v => setField('enterprise_name', v)} />

            <Text style={styles.inputLabel}>Type of Activities/Product</Text>
            <TextInput style={styles.input} value={form.enterprise_type} onChangeText={v => setField('enterprise_type', v)} />

            <Text style={styles.inputLabel}>Year of Establishment</Text>
            <TextInput style={styles.input} value={form.year_establishment} onChangeText={v => setField('year_establishment', v)} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Type of Business</Text>
            <TextInput style={styles.input} value={form.type_business} onChangeText={v => setField('type_business', v)} />

            <Text style={styles.inputLabel}>Monthly Income (approx)</Text>
            <TextInput style={styles.input} value={form.monthly_income} onChangeText={v => setField('monthly_income', v)} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Number of Employees</Text>
            <TextInput style={styles.input} value={form.employees} onChangeText={v => setField('employees', v)} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Sales Area</Text>
            <TextInput style={styles.input} value={form.sales_area} onChangeText={v => setField('sales_area', v)} />

            <Text style={styles.inputLabel}>Have you received scheme support in the past?</Text>
            <Picker
              style={styles.picker}
              selectedValue={form.past_scheme_support}
              onValueChange={v => setField('past_scheme_support', v)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </>
        )}
      </Section>

      <Section title="For Non-Enterprise">
        <Text style={styles.inputLabel}>Are you interested in starting an enterprise?</Text>
        <Picker
          style={styles.picker}
          selectedValue={form.interested_enterprise}
          onValueChange={v => setField('interested_enterprise', v)}
        >
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Yes" value="Yes" />
          <Picker.Item label="No" value="No" />
        </Picker>

        {form.interested_enterprise === 'Yes' && (
          <>
            <Text style={styles.inputLabel}>Type of Work/Business interested in</Text>
            <TextInput style={styles.input} value={form.interested_type} onChangeText={v => setField('interested_type', v)} />

            <Text style={styles.inputLabel}>Have you selected a location for enterprise?</Text>
            <Picker
              style={styles.picker}
              selectedValue={form.selected_location}
              onValueChange={v => setField('selected_location', v)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>

            <Text style={styles.inputLabel}>Have you received any kind of training?</Text>
            <Picker
              style={styles.picker}
              selectedValue={form.received_training}
              onValueChange={v => setField('received_training', v)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>

            {form.received_training === 'Yes' && (
              <>
                <Text style={styles.inputLabel}>Training Detail</Text>
                <TextInput style={styles.input} value={form.training_detail} onChangeText={v => setField('training_detail', v)} multiline />
              </>
            )}
          </>
        )}
      </Section>

      <Section title="Support Required">
        <Checkbox label="Skill Training" value={form.support_skill} onChange={v => setField('support_skill', v)} />
        <Checkbox label="Entrepreneurship Development Training" value={form.support_training} onChange={v => setField('support_training', v)} />
        <Checkbox label="Financial Assistance / Credit Linkage" value={form.support_finance} onChange={v => setField('support_finance', v)} />
        <Checkbox label="Market Linkage / Branding" value={form.support_market} onChange={v => setField('support_market', v)} />
        <Checkbox label="Infrastructure Support" value={form.support_infra} onChange={v => setField('support_infra', v)} />
        <Checkbox label="Digital / e-Market Linkage" value={form.support_digital} onChange={v => setField('support_digital', v)} />

        <Text style={styles.inputLabel}>Other (please specify)</Text>
        <TextInput style={styles.input} value={form.support_other} onChangeText={v => setField('support_other', v)} />
      </Section>

      <Section title="Declaration">
        <Text style={{ marginBottom: 8 }}>
          I declare that all the information provided above is true to the best of my knowledge and belief. I am willing to participate in entrepreneur and livelihood promotion activities organised by UPSRLM.
        </Text>
        <Text style={styles.inputLabel}>Signature / Thumb Impression</Text>
        <TextInput style={styles.input} />

        <Text style={styles.inputLabel}>Date</Text>
        <TextInput style={styles.input} />

        <Text style={styles.inputLabel}>Verifier (Community Resource Person / Block Staff Name)</Text>
        <TextInput style={styles.input} />
      </Section>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#FFE5E5',
    padding: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#EE6969',
  },
  inputLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#EE6969',
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#EE6969',
    borderRadius: 6,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#EE6969',
    marginRight: 8,
    borderRadius: 4,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#EE6969',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
