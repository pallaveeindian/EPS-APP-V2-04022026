import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import gsApi from '../../../api/gsApi';
import { Linking, TouchableOpacity } from 'react-native';
export default function EPSDetail() {
  const route = useRoute();
  const { epsId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetchDetail = async () => {
    if (!epsId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await gsApi.getEpsakhiDetailByMember(epsId);
      setDetail(res);
    } catch (err) {
      Alert.alert('Error', 'Unable to load beneficiary details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#EE6969"
        style={{ marginTop: 40 }}
      />
    );
  }

  if (!detail) {
    return <Text style={styles.noData}>No details found.</Text>;
  }
  const trainingData =
    detail?.existing_enterprise?.training?.length > 0
      ? detail.existing_enterprise.training
      : detail?.shared?.training;
  const isExisting = detail?.enterprise_type === 'existing';
  const isNew = detail?.enterprise_type === 'new';
  const BASE_URL = 'http://66.116.207.88:8088';

  return (
    <ScrollView style={styles.container}>
      {/* ================= 1️ Beneficiary Information ================= */}
      <Section title="1. Beneficiary Information">
        <DetailRow label="TH URID" value={detail.beneficiary?.TH_urid} />
        <DetailRow
          label="Lokos Member Code"
          value={detail.beneficiary?.lokos_member_code}
        />
        <DetailRow
          label="Applicant Name"
          value={detail.beneficiary?.applicant_name}
        />
        <DetailRow label="Age" value={detail.beneficiary?.age} />
        <DetailRow label="Gender" value={detail.beneficiary?.gender} />
        <DetailRow
          label="Marital Status"
          value={detail.beneficiary?.marital_status}
        />
        <DetailRow
          label="Father/Husband Name"
          value={detail.beneficiary?.father_husband_name}
        />
        <DetailRow label="Category" value={detail.beneficiary?.category} />
        <DetailRow label="PLD Status" value={detail.beneficiary?.pld_status} />
        <DetailRow
          label="Enterprise Type"
          value={detail.beneficiary?.enterprise_type}
        />
        <DetailRow label="Education" value={detail.beneficiary?.education} />
        <DetailRow label="Address" value={detail.beneficiary?.address} />
        <DetailRow
          label="District"
          value={detail.beneficiary?.district_name_en}
        />
        <DetailRow label="Block" value={detail.beneficiary?.block_name_en} />
        <DetailRow
          label="Panchayat"
          value={detail.beneficiary?.panchayat_name_en}
        />
        <DetailRow
          label="Village"
          value={detail.beneficiary?.village_name_english}
        />
        <DetailRow label="Mobile" value={detail.beneficiary?.mobile} />
        <DetailRow label="Email" value={detail.beneficiary?.email} />
        <DetailRow
          label="Lokos SHG Code"
          value={detail.beneficiary?.lokos_shg_code}
        />
        <DetailRow
          label="Enterprise ID"
          value={detail.beneficiary?.enterprise_id}
        />
      </Section>

      {/* ================= 2️ Basic Information (Shown for Both) ================= */}
      <Section title="2. Basic Information">
        <DetailRow
          label="Enterprise Name"
          value={detail.enterprise?.enterprise_name}
        />
        <DetailRow
          label="Enterprise Type (Form)"
          value={detail.enterprise_type}
        />
        <DetailRow
          label="Enterprise TH URID"
          value={detail.enterprise?.TH_urid}
        />
        <DetailRow
          label="Enterprise ID (Numeric)"
          value={detail.enterprise?.id}
        />
        <DetailRow
          label="Ownership Type"
          value={detail.enterprise?.ownership_type}
        />
        <DetailRow label="Owner Cadre" value={detail.enterprise?.owner_cadre} />
        <DetailRow
          label="Owner Designation"
          value={detail.enterprise?.owner_designation}
        />
        <DetailRow
          label="Need Transport Help"
          value={detail.enterprise?.need_transport_help ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Can Send to Bijnor"
          value={detail.enterprise?.can_send_to_bijnor ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Have Shop Based Product"
          value={detail.enterprise?.have_shop_based_prod ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Has Taken Loan"
          value={detail.enterprise?.has_taken_loan ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Has Received Subsidy"
          value={detail.enterprise?.has_receieved_subsidy ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Has SHG Received Mandatory Fund"
          value={detail.enterprise?.has_shg_receieved_man_fund ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Training Received"
          value={detail.enterprise?.is_training_received ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Training Required"
          value={detail.enterprise?.is_training_required ? 'Yes' : 'No'}
        />
        <DetailRow
          label="Support Required"
          value={detail.enterprise?.is_support_required}
        />
        <DetailRow
          label="Nearest Skill Centre"
          value={detail.enterprise?.nearest_skill_centre}
        />
        <DetailRow
          label="Skill Centre Location"
          value={detail.enterprise?.skill_centre_loc}
        />
        <DetailRow
          label="Nearest Industry"
          value={detail.enterprise?.nearest_industry}
        />
        <DetailRow
          label="Industry Location"
          value={detail.enterprise?.industry_loc}
        />
        <DetailRow
          label="Special Category"
          value={detail.enterprise?.owner_special_category}
        />
        <DetailRow
          label="Year Of Establishment"
          value={detail.enterprise?.year_of_establishment}
        />
        <DetailRow
          label="Total Employee"
          value={detail.enterprise?.total_emp}
        />
        <DetailRow
          label="Number of shg"
          value={detail.enterprise?.number_of_shg_emp}
        />
      </Section>

      {/* ================= EXISTING ENTERPRISE ONLY SECTIONS ================= */}
      {isExisting && (
        <>
          {/* 3️ Enterprise Details */}
          <Section title="3. Enterprise Details">
            <DetailRow
              label="Workplace Type"
              value={detail.enterprise?.workplace_type}
            />
            <DetailRow
              label="Electricity"
              value={detail.enterprise?.electricity_available}
            />
            <DetailRow
              label="Water"
              value={detail.enterprise?.water_available}
            />
            <DetailRow
              label="Transport Availability"
              value={detail.enterprise?.transportation_availability}
            />
            <DetailRow
              label="Send to bijnor"
              value={detail.enterprise?.can_send_to_bijnor}
            />
            <DetailRow
              label="Need Transport Help"
              value={detail.enterprise?.need_transport_help}
            />
          </Section>

          {/* 4️ Product Details */}
          <Section title="4. Product Details">
            {detail.existing_enterprise?.products?.map((prod, index) => (
              <View key={index}>
                <DetailRow
                  label="Main Product"
                  value={prod.main_product_name}
                />
                <DetailRow
                  label="Product Type"
                  value={prod.activity_or_product_type}
                />
                <DetailRow
                  label="Product Features"
                  value={prod.product_features}
                />
                <DetailRow
                  label="Target Customers"
                  value={prod.target_customers}
                />
                <DetailRow
                  label="Production Capacity"
                  value={prod.production_capacity}
                />
                <DetailRow label="Raw Material" value={prod.raw_material} />
                <DetailRow
                  label="Raw Material Source"
                  value={prod.raw_material_source}
                />
                <DetailRow label="Machinery" value={prod.machinery_equipment} />
                <DetailRow
                  label="Machinery Source"
                  value={prod.source_machinery}
                />
                <DetailRow label="MRP" value={prod.product_mrp} />
                <DetailRow label="Sales Area" value={prod.sales_area} />
                <DetailRow
                  label="Target Customers"
                  value={prod.target_customers}
                />
                <DetailRow
                  label="Packaging Status"
                  value={prod.packaging_branding_status}
                />
                <DetailRow
                  label="Marketing Strategy"
                  value={prod.marketing_strategy}
                />
                <DetailRow
                  label="Marketing Channels"
                  value={prod.marketing_channels}
                />
                <DetailRow
                  label="Marketing Challenges"
                  value={prod.marketing_challenges}
                />
                <DetailRow label="Market Linkage" value={prod.market_linkage} />
                <DetailRow
                  label="Accept Digital Payment"
                  value={prod.accept_digital_payment ? 'Yes' : 'No'}
                />
                <DetailRow
                  label="Avg Monthly Sales"
                  value={prod.avg_monthly_sales}
                />
                <DetailRow
                  label="Avg Annual Sales"
                  value={prod.avg_annual_sales}
                />
                {prod.product_media?.map((m, i) => (
                  <View key={i} style={{ marginBottom: 15 }}>
                    {m.open_box_photo && (
                      <Image
                        source={{ uri: BASE_URL + m.open_box_photo }}
                        style={styles.image}
                      />
                    )}

                    {m.close_box_photo && (
                      <Image
                        source={{ uri: BASE_URL + m.close_box_photo }}
                        style={styles.image}
                      />
                    )}

                    {m.others && (
                      <Image
                        source={{ uri: BASE_URL + m.others }}
                        style={styles.image}
                      />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </Section>

          {/* 5️ Shop Details */}
          <Section title="5. Shop Details">
            <DetailRow
              label="Shop Category"
              value={detail.existing_enterprise?.shop?.shop_category}
            />
            <DetailRow
              label="Shop Type"
              value={detail.existing_enterprise?.shop?.shop_type}
            />
            <DetailRow
              label="Source of Inventory"
              value={detail.existing_enterprise?.shop?.source_of_inventory}
            />
            <DetailRow
              label="Target Customers"
              value={detail.existing_enterprise?.shop?.target_customers}
            />
            <DetailRow
              label="Sales Area"
              value={detail.existing_enterprise?.shop?.sales_area}
            />
            <DetailRow
              label="Marketing Strategy"
              value={detail.existing_enterprise?.shop?.marketing_strategy}
            />
            <DetailRow
              label="Marketing Channels"
              value={detail.existing_enterprise?.shop?.marketing_channels}
            />
            <DetailRow
              label="Marketing Challenges"
              value={detail.existing_enterprise?.shop?.marketing_challenges}
            />
            <DetailRow
              label="Market Linkage"
              value={detail.existing_enterprise?.shop?.market_linkage}
            />
            <DetailRow
              label="Accept Digital Payment"
              value={
                detail.existing_enterprise?.shop?.accept_digital_payment
                  ? 'Yes'
                  : 'No'
              }
            />
            <DetailRow
              label="Avg Monthly Sales"
              value={detail.existing_enterprise?.shop?.avg_monthly_sales}
            />
            <DetailRow
              label="Avg Annual Sales"
              value={detail.existing_enterprise?.shop?.avg_annual_sales}
            />
            {detail.existing_enterprise?.shop_media?.map((m, i) => (
              <View key={i}>
                {m.front_photo && (
                  <Image
                    source={{ uri: BASE_URL + m.front_photo }}
                    style={styles.image}
                  />
                )}
                {m.inside_photo && (
                  <Image
                    source={{ uri: BASE_URL + m.inside_photo }}
                    style={styles.image}
                  />
                )}
                {m.others && (
                  <Image
                    source={{ uri: BASE_URL + m.others }}
                    style={styles.image}
                  />
                )}
              </View>
            ))}
          </Section>

          {/* 6️ Investment */}
          <Section title="6. Investment Details">
            <DetailRow
              label="Monthly Income Estimate"
              value={detail.enterprise?.monthly_income_estimate}
            />
            <DetailRow
              label="Annual Turnover"
              value={detail.enterprise?.annual_turnover}
            />
            <DetailRow
              label="Gross Profit"
              value={detail.enterprise?.gross_profit}
            />
            <DetailRow
              label="Working Capital Monthly"
              value={detail.enterprise?.working_capital_monthly}
            />
            <DetailRow
              label="Initial Investment"
              value={detail.enterprise?.initial_investment}
            />
            <DetailRow
              label="Source of Investment"
              value={detail.enterprise?.source_of_investment}
            />
          </Section>

          {/* 7️ Loan */}
          <Section title="7. Loan Details">
            {detail.existing_enterprise?.loan_details?.map((loan, i) => (
              <View key={i}>
                <DetailRow label="Department" value={loan.department} />
                <DetailRow label="Institution" value={loan.institution_name} />
                <DetailRow label="Bank Name" value={loan.bank_name} />
                <DetailRow label="Branch" value={loan.bank_branch} />
                <DetailRow label="Loan Amount" value={loan.loan_amount} />
                <DetailRow label="Repaid Amount" value={loan.repaid_amount} />
                <DetailRow label="Date Taken" value={loan.date_taken} />
                <DetailRow
                  label="Repayment Status"
                  value={loan.repayment_status}
                />
              </View>
            ))}
          </Section>

          {/* 8️ Licenses */}
          <Section title="8. Licenses">
            {detail.existing_enterprise?.licenses?.map((lic, i) => (
              <View key={i}>
                <DetailRow
                  label="License Category"
                  value={lic.license_category}
                />
                <DetailRow label="License Name" value={lic.license_name} />
                <DetailRow label="License No" value={lic.license_no} />
                <DetailRow
                  label="License File"
                  value={
                    lic.license_file ? `${BASE_URL}${lic.license_file}` : null
                  }
                  isLink={true}
                />
              </View>
            ))}
          </Section>

          {/* 9️ Subsidy */}
          <Section title="9. Subsidy Details">
            {detail.existing_enterprise?.subsidy_details?.map((sub, i) => (
              <View key={i}>
                <DetailRow label="Subsidy Type" value={sub.subsidy_type} />
                <DetailRow label="Subsidy Name" value={sub.subsidy_name} />
                <DetailRow label="Subsidy Detail" value={sub.subsidy_detail} />
              </View>
            ))}
          </Section>

          <Section title="10. Training Details">
            {detail.shared?.training?.length > 0 ? (
              detail.shared.training.map((train, i) => (
                <View key={i}>
                  <DetailRow label="Form Type" value={train.form_type} />
                  <DetailRow label="Sector Type" value={train.sector_type} />
                  <DetailRow label="Sector" value={train.sector} />
                  <DetailRow label="Department" value={train.department} />
                  <DetailRow
                    label="Training Type"
                    value={train.training_type}
                  />
                  <DetailRow label="Duration" value={train.duration} />
                  <DetailRow label="Location" value={train.location} />
                  <DetailRow
                    label="Expected Income"
                    value={train.expected_income}
                  />

                  {train.certificates?.map((cert, cIndex) => (
                    <DetailRow
                      key={cIndex}
                      label="Certificate"
                      value={
                        cert.certificates
                          ? `${BASE_URL}${cert.certificates}`
                          : null
                      }
                      isLink={true}
                    />
                  ))}
                </View>
              ))
            ) : (
              <DetailRow label="Training" value="No Training Data Found" />
            )}
          </Section>

          {/* 10 Support */}
          <Section title="11. Support & Mandatory Fund">
            {detail.shared?.enterprise_support?.map((sup, i) => (
              <View key={i}>
                <DetailRow
                  label="Support Category"
                  value={sup.support_category}
                />
                <DetailRow
                  label="Sub Category"
                  value={sup.support_sub_category}
                />
                <DetailRow
                  label="Description"
                  value={sup.support_description}
                />
                <DetailRow label="Other Support" value={sup.other_support} />
              </View>
            ))}

            {detail.shared?.mandatory_fund?.map((fund, i) => (
              <View key={i}>
                <DetailRow label="Fund Type" value={fund.fund_type} />
                <DetailRow
                  label="Have Received Part"
                  value={fund.have_received_part ? 'Yes' : 'No'}
                />
                <DetailRow
                  label="Amount Received"
                  value={fund.amount_received}
                />
                <DetailRow label="Amount Repaid" value={fund.amount_repaid} />
                <DetailRow
                  label="Repayment Status"
                  value={fund.repayment_status}
                />
              </View>
            ))}
          </Section>

          {/*  Declaration */}
          <Section title="12. Declaration">
            <DetailRow
              label="Declaration Confirmed"
              value={detail.enterprise?.declaration_confirmed ? 'Yes' : 'No'}
            />
            <DetailRow
              label="Declaration Date"
              value={detail.enterprise?.declaration_date}
            />
            <DetailRow
              label="Verifier Name"
              value={detail.enterprise?.verifier_name}
            />
            {detail.existing_enterprise?.enterprise_media?.map((m, i) => (
              <View key={i} style={{ marginBottom: 15 }}>
                {m.photo_entrepreneur && (
                  <>
                    <Text style={styles.label}>Entrepreneur Photo</Text>
                    <Image
                      source={{ uri: BASE_URL + m.photo_entrepreneur }}
                      style={styles.image}
                    />
                  </>
                )}

                {m.photo_enterprise && (
                  <>
                    <Text style={styles.label}>Enterprise Photo</Text>
                    <Image
                      source={{ uri: BASE_URL + m.photo_enterprise }}
                      style={styles.image}
                    />
                  </>
                )}

                {m.others && (
                  <>
                    <Text style={styles.label}>Other Media</Text>
                    <Image
                      source={{ uri: BASE_URL + m.others }}
                      style={styles.image}
                    />
                  </>
                )}
              </View>
            ))}
          </Section>
        </>
      )}
      {isNew && (
        <>
          <Section title="Training Details">
            {detail.shared?.training?.map((train, i) => (
              <View key={i}>
                <DetailRow label="Form Type" value={train.form_type} />
                <DetailRow label="Sector Type" value={train.sector_type} />
                <DetailRow label="Sector" value={train.sector} />
                <DetailRow label="Department" value={train.department} />
                <DetailRow label="Training Type" value={train.training_type} />
                <DetailRow label="Duration" value={train.duration} />
                <DetailRow label="Location" value={train.location} />
                <DetailRow
                  label="Expected Income"
                  value={train.expected_income}
                />
                {train.certificates?.map((cert, cIndex) => (
                  <DetailRow
                    key={cIndex}
                    label="Certificate"
                    value={cert.certificates}
                  />
                ))}
              </View>
            ))}
          </Section>

          <Section title="Support & Mandatory Fund">
            {detail.shared?.enterprise_support?.map((sup, i) => (
              <View key={i}>
                <DetailRow
                  label="Support Category"
                  value={sup.support_category}
                />
                <DetailRow
                  label="Sub Category"
                  value={sup.support_sub_category}
                />
                <DetailRow
                  label="Description"
                  value={sup.support_description}
                />
                <DetailRow label="Other Support" value={sup.other_support} />
              </View>
            ))}

            {detail.shared?.mandatory_fund?.map((fund, i) => (
              <View key={i}>
                <DetailRow label="Fund Type" value={fund.fund_type} />
                <DetailRow
                  label="Have Received Part"
                  value={fund.have_received_part ? 'Yes' : 'No'}
                />
                <DetailRow
                  label="Amount Received"
                  value={fund.amount_received}
                />
                <DetailRow label="Amount Repaid" value={fund.amount_repaid} />
                <DetailRow
                  label="Repayment Status"
                  value={fund.repayment_status}
                />
              </View>
            ))}
          </Section>

          <Section title="10. Declaration">
            <DetailRow
              label="Declaration Confirmed"
              value={detail.enterprise?.declaration_confirmed ? 'Yes' : 'No'}
            />
            <DetailRow
              label="Declaration Date"
              value={detail.enterprise?.declaration_date}
            />
            <DetailRow
              label="Verifier Name"
              value={detail.enterprise?.verifier_name}
            />
            {detail.existing_enterprise?.enterprise_media?.map((m, i) => (
              <View key={i}>
                <DetailRow
                  label="Entrepreneur Photo"
                  value={m.photo_entrepreneur}
                />
                <DetailRow
                  label="Enterprise Photo"
                  value={m.photo_enterprise}
                />
                <DetailRow label="Other Media" value={m.others} />
              </View>
            ))}
          </Section>
        </>
      )}
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value, isLink }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      {isLink && value ? (
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(value).catch(() =>
              Alert.alert('Error', 'Unable to open PDF'),
            );
          }}
        >
          <Text
            style={[
              styles.value,
              { color: 'blue', textDecorationLine: 'underline' },
            ]}
          >
            View PDF
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.value}>{value || '-'}</Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#EE6969',
  },
  row: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    color: '#444',
  },
  value: {
    color: '#000',
  },
  noData: {
    textAlign: 'center',
    marginTop: 40,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
});
