import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Reusable Input Component
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

// Reusable Section Heading
const SectionHeading = ({ title }) => (
  <Text style={styles.sectionHeading}>{title}</Text>
);

export const NewEnterpriseRecordForm = () => {
  // Basic Details
  const [applicantName, setApplicantName] = useState('');
  const [fatherSpouseName, setFatherSpouseName] = useState('');
  const [age, setAge] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [gram, setGram] = useState('');
  const [shgVoClf, setShgVoClf] = useState('');
  const [shgMembership, setShgMembership] = useState('');

  // Enterprise Details
  const [hasEnterprise, setHasEnterprise] = useState('No');
  const [enterpriseName, setEnterpriseName] = useState('');
  const [activityType, setActivityType] = useState('');
  const [establishmentYear, setEstablishmentYear] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [numEmployees, setNumEmployees] = useState('');
  const [salesArea, setSalesArea] = useState('');
  const [schemeSupport, setSchemeSupport] = useState('No');

  // Non-Enterprise
  const [interestedEnterprise, setInterestedEnterprise] = useState('No');
  const [interestedType, setInterestedType] = useState('');
  const [locationSelected, setLocationSelected] = useState('No');
  const [trainingReceived, setTrainingReceived] = useState('No');
  const [trainingDetail, setTrainingDetail] = useState('');

  // Support Required
  const [supportAreas, setSupportAreas] = useState({
    skillTraining: false,
    entrepreneurshipTraining: false,
    financialAssistance: false,
    marketLinkage: false,
    infrastructureSupport: false,
    digitalLinkage: false,
    other: false,
    otherText: '',
  });

  // Declaration
  const [signature, setSignature] = useState('');
  const [date, setDate] = useState('');
  const [verifier, setVerifier] = useState('');

  const handleSubmit = () => {
    Alert.alert('Form Submitted', 'Your data has been saved successfully.');
  };

  const toggleSupport = (key) => {
    setSupportAreas({ ...supportAreas, [key]: !supportAreas[key] });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Basic Details */}
      <SectionHeading title="Basic Details" />
      <FormInput label="Applicant Name" value={applicantName} onChangeText={setApplicantName} placeholder="Enter name" />
      <FormInput label="Father/Spouse Name" value={fatherSpouseName} onChangeText={setFatherSpouseName} placeholder="Enter name" />
      <FormInput label="Age (years)" value={age} onChangeText={setAge} placeholder="Enter age" keyboardType="numeric" />
      <FormInput label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} placeholder="Enter mobile" keyboardType="phone-pad" />
      <FormInput label="Address" value={address} onChangeText={setAddress} placeholder="Enter address" />
      <FormInput label="District" value={district} onChangeText={setDistrict} placeholder="Enter district" />
      <FormInput label="Block" value={block} onChangeText={setBlock} placeholder="Enter block" />
      <FormInput label="Gram" value={gram} onChangeText={setGram} placeholder="Enter gram" />
      <FormInput label="SHG/VO/CLF Name (if member)" value={shgVoClf} onChangeText={setShgVoClf} placeholder="Enter name" />
      <FormInput label="SHG Membership (if any)" value={shgMembership} onChangeText={setShgMembership} placeholder="Enter membership number" />

      {/* Enterprise Details */}
      <SectionHeading title="Enterprise Details" />
      <Text style={styles.label}>Do you currently have any enterprise/business?</Text>
      <Picker
        selectedValue={hasEnterprise}
        style={styles.picker}
        onValueChange={(itemValue) => setHasEnterprise(itemValue)}
      >
        <Picker.Item label="No" value="No" />
        <Picker.Item label="Yes" value="Yes" />
      </Picker>

      {hasEnterprise === 'Yes' && (
        <>
          <FormInput label="Enterprise/Business Name" value={enterpriseName} onChangeText={setEnterpriseName} placeholder="Enter name" />
          <FormInput label="Type of Activities/Product" value={activityType} onChangeText={setActivityType} placeholder="Enter type" />
          <FormInput label="Year of Establishment" value={establishmentYear} onChangeText={setEstablishmentYear} placeholder="Enter year" keyboardType="numeric" />
          <FormInput label="Type of Business" value={businessType} onChangeText={setBusinessType} placeholder="Manufacturing, Service, Trading, Other" />
          <FormInput label="Monthly Income (approx)" value={monthlyIncome} onChangeText={setMonthlyIncome} placeholder="Enter income" keyboardType="numeric" />
          <FormInput label="Number of Employees" value={numEmployees} onChangeText={setNumEmployees} placeholder="Enter number" keyboardType="numeric" />
          <FormInput label="Sales Area" value={salesArea} onChangeText={setSalesArea} placeholder="Local, District, Online, Other" />
          <Text style={styles.label}>Have you received scheme support in the past?</Text>
          <Picker
            selectedValue={schemeSupport}
            style={styles.picker}
            onValueChange={(itemValue) => setSchemeSupport(itemValue)}
          >
            <Picker.Item label="No" value="No" />
            <Picker.Item label="Yes" value="Yes" />
          </Picker>
        </>
      )}

      {/* Non-Enterprise Section */}
      <SectionHeading title="For Non-Enterprise" />
      <Text style={styles.label}>Are you interested in starting an enterprise?</Text>
      <Picker
        selectedValue={interestedEnterprise}
        style={styles.picker}
        onValueChange={(itemValue) => setInterestedEnterprise(itemValue)}
      >
        <Picker.Item label="No" value="No" />
        <Picker.Item label="Yes" value="Yes" />
      </Picker>

      {interestedEnterprise === 'Yes' && (
        <>
          <FormInput label="Type of Work/Business Interested In" value={interestedType} onChangeText={setInterestedType} placeholder="Food processing, Sewing, Beauty parlor..." />
          <Text style={styles.label}>Have you selected a location for enterprise?</Text>
          <Picker
            selectedValue={locationSelected}
            style={styles.picker}
            onValueChange={(itemValue) => setLocationSelected(itemValue)}
          >
            <Picker.Item label="No" value="No" />
            <Picker.Item label="Yes" value="Yes" />
          </Picker>
          <Text style={styles.label}>Have you received any kind of training?</Text>
          <Picker
            selectedValue={trainingReceived}
            style={styles.picker}
            onValueChange={(itemValue) => setTrainingReceived(itemValue)}
          >
            <Picker.Item label="No" value="No" />
            <Picker.Item label="Yes" value="Yes" />
          </Picker>
          {trainingReceived === 'Yes' && (
            <FormInput label="Training Details" value={trainingDetail} onChangeText={setTrainingDetail} placeholder="Enter training details" />
          )}
        </>
      )}

      {/* Support Required */}
      <SectionHeading title="Support Required" />
      {[ 
        { key: 'skillTraining', label: 'Skill Training' },
        { key: 'entrepreneurshipTraining', label: 'Entrepreneurship Development Training' },
        { key: 'financialAssistance', label: 'Financial Assistance / Credit Linkage' },
        { key: 'marketLinkage', label: 'Market Linkage / Branding' },
        { key: 'infrastructureSupport', label: 'Infrastructure Support' },
        { key: 'digitalLinkage', label: 'Digital / E-Market Linkage' },
        { key: 'other', label: 'Other (please specify)' },
      ].map((item) => (
        <View key={item.key} style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, supportAreas[item.key] && styles.checkedBox]}
            onPress={() => toggleSupport(item.key)}
          />
          <Text style={styles.checkboxLabel}>{item.label}</Text>
          {item.key === 'other' && supportAreas.other && (
            <TextInput
              style={styles.input}
              placeholder="Specify other support"
              value={supportAreas.otherText}
              onChangeText={(text) => setSupportAreas({ ...supportAreas, otherText: text })}
            />
          )}
        </View>
      ))}

      {/* Declaration */}
      <SectionHeading title="Declaration" />
      <Text style={styles.declaration}>
        I declare that all the information provided above is true to the best of my knowledge and belief. I am willing to participate in entrepreneurship and livelihood promotion activities organised by UPSRLM.
      </Text>
      <FormInput label="Signature / Thumb Impression" value={signature} onChangeText={setSignature} placeholder="Enter signature" />
      <FormInput label="Date" value={date} onChangeText={setDate} placeholder="DD/MM/YYYY" />
      <FormInput label="Verifier (Community Resource Person / Block Staff Name)" value={verifier} onChangeText={setVerifier} placeholder="Enter verifier name" />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7', // background color
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 10,
  },
  inputContainer: {
    marginVertical: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000000',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    marginRight: 8,
  },
  checkedBox: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
  },
  declaration: {
    fontSize: 14,
    color: '#333333',
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});
