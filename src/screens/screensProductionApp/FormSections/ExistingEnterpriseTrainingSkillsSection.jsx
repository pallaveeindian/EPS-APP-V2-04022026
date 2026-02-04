// src/screens/screensProductionApp/FormSections/ExistingEnterpriseTrainingSkillsSection.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { launchCamera } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';




const YES_NO = ['Yes', 'No'];

const TRAINING_DEPT_OPTIONS = ['NRLM', 'RSETI', 'NABARD', 'UPSDM', 'Others'];

const TRAINING_TYPE_OPTIONS = [
  'Residential',
  'Non-Residential',
];


const TRAINING_DURATION_OPTIONS = [
  'Under 7 days',
  '7 days',
  '15 days',
  '30 days',
  'Over 30 days',
];

const EXPECTED_INCOME_OPTIONS = [
  'Under 10,000',
  '10,000 - 20,000',
  '20,000 - 30,000',
  'Above 30,000',
];

/**
 * Sector tree for both training received and training required
 * Parent -> list of child modules
 */
const TRAINING_SECTOR_TREE = [
  // {
  //   parent: 'Agriculture and Allied Activities',
  //   children: [
  //     'Organic Farming',
  //     'Dairy Farming',
  //     'Poultry Farming',
  //     'Mushroom Cultivation',
  //     'Beekeeping and Honey Production',
  //     'Goat Rearing',
  //     'Vermicomposting',
  //     'Fish Farming',
  //     'Floriculture (Flower Cultivation)',
  //     'Medicinal Plant Cultivation',
  //     'Organic Fertilizer Production',
  //      'Ayurvedic Medicine Manufacturing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Food Processing and Snacks Business',
  //   children: [
  //     'Pickle and Papad Making',
  //     'Bakery and Cake Production',
  //     'Spice Powder Making',
  //     'Flour Mill',
  //     'Dairy Product Manufacturing (Paneer, Ghee)',
  //     'Ready-to-Eat Food Preparation',
  //     'Herbal Tea Manufacturing',
  //     'Jam and Jelly Production',
  //     'Frozen Food Business',
  //     'Edible Oil Extraction',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Handicrafts and Traditional Skills',
  //   children: [
  //     'Banarasi Saree Weaving',
  //     'Chikankari Embroidery',
  //     'Wooden Handicrafts',
  //     'Terracotta Pottery',
  //     'Jute Bag Manufacturing',
  //     'Handmade Jewelry',
  //     'Toy Manufacturing',
  //     'Paper Mache Art',
  //     'Bamboo Craft',
  //     'Leather Product Manufacturing',
  //     'Handloom Weaving Cooperative Society',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Service-Based Businesses',
  //   children: [
  //     'Catering Service',
  //     'Tailoring and Garment Making',
  //     'Event Decoration',
  //     'Beautician and Salon',
  //     'Coaching Classes',
  //     'Mobile Repairing',
  //     'Home Cleaning Services',
  //     'Photography Studio',
  //     'Cyber Café',
  //     'Wedding Planning',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Waste Management and Eco-Friendly Ventures',
  //   children: [
  //     'Paper Bag Manufacturing',
  //     'Cloth Bag Manufacturing',
  //     'Plastic Recycling',
  //     'E-waste Recycling',
  //     'Compost Manufacturing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Home and Personal Care Products',
  //   children: [
  //     'Candle Manufacturing',
  //     'Incense Stick Making',
  //     'Soap and Detergent Manufacturing',
  //     'Bindi and Nail Polish Manufacturing',
  //     'Herbal Shampoo and Cosmetic Products',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Low-Scale Production',
  //   children: [
  //     'Paper Plate and Cup Manufacturing',
  //     'LED Bulb Assembly',
  //     'Stationery Production',
  //     'Environment-Friendly Disposable Cutlery',
  //     'Chalk and Whiteboard Marker Manufacturing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Textile and Apparel Business',
  //   children: [
  //     'Wool Weaving and Sweater Production',
  //     'Bedsheet and Curtain Stitching',
  //     'T-shirt Printing',
  //     'School Uniform Manufacturing',
  //     'Handloom Carpet Weaving',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Animal Husbandry and Agri-Based Enterprises',
  //   children: [
  //     'Pig Rearing',
  //     'Emu Farming',
  //     'Duck Rearing',
  //     'Organic Fruit and Vegetable Farming',
  //     'Poultry Egg Incubation',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'E-commerce and Online Business',
  //   children: [
  //     'Online Handicraft Selling',
  //     'Home-Based Bakery on Food Delivery Platforms',
  //     'Dropshipping Business',
  //     'Print-on-Demand T-shirts',
  //     'YouTube Channel (DIY or Tutorials)',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Renewable Energy and Environment-Friendly Enterprises',
  //   children: [
  //     'Solar Panel Installation Services',
  //     'Bio-Gas Plant Setup',
  //     'Electric Vehicle Charging Station',
  //     'Waste Paper Recycling',
  //     'Bamboo Toothbrush and Cutlery Manufacturing',
  //     'Solar Lamp Assembly',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Tourism and Local Experience Businesses',
  //   children: [
  //     'Homestays for Tourists',
  //     'Heritage Walk Guide Services',
  //     'Rural Adventure Camps',
  //     'Boat Tours on Ganges',
  //     'Organic Farm Tour Business',
  //     'Rural Tourism and Homestay',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'FMCG',
  //   children: [
  //     'Handwash',
  //     'Soap',
  //     'Floor Cleaner',
  //     'Detergents',
  //     'Air fresheners',
  //     'Face wash & creams',
  //     'Shampoo & conditioner',
  //     'Sponges',
  //     'Toothpaste & toothbrushes',
  //     'Others',
  //   ],
  // },
  //  {
  //   parent: 'Transport',
  //   children: [
  //     'Loader',
  //     'E-Rikshaw',
  //     'Taxi',
  //     'Auto',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Prerna Canteen',
  //   children: [
  //   ],
  // },
  // {
  //   parent: 'Transport and Logistics Business',
  //   children: [
  //     'E-rickshaw Rental Service',
  //     'Pack and Move Services',
  //     'Small Courier Delivery Service',
  //     'Bike Rental Business',
  //     'Agricultural Equipment Rental Service',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'EDP|Entrepreneurship Development Programme ',
  //   children: [
  //   ]},
  // {
  //   parent: 'Miscellaneous and Innovative Businesses',
  //   children: [
  //     'Toy Library for Children',
  //     'DIY Craft Kit Shop and Classes',
  //     'Community Kitchen',
  //     'Custom Gift Box Manufacturing',
  //     'Pet Grooming Services',
  //     'Digital Marketing for Local Businesses',
  //     'Document and Resume Writing Services',
  //     'Resale of Used Goods',
  //     'Organic Soap Manufacturing Kit Shop',
  //     'Wedding Invitation Card Designing',
  //     'Others',
  //   ],
  // },
  // {
  //   parent: 'Others (Specify)',
  //   children: ['Others'],
  // },
   {
    parent: 'Food Processing Sector',
    children: [
      'Spice manufacturing',
      'Pickles, preserves (murabba), papad',
      'Savoury snacks, bhujiya, namkeen',
      'Instant mixes (idli mix, gram flour mix, kheer mix)',
      'Bakery items (cookies, cake, bread)',
      'Millet-based products (jowar, bajra cookies, snacks)',
      'Cold-pressed oils (mustard/sesame)',
      'Honey processing',
      'Jam–jelly–squash',
      'Ready-to-eat products',
      'Jaggery Production',
      'Whole grain/pulses/flour sorting–grading–packaging unit​',
      'Others',
    ],
  },
  {
    parent: 'Handicraft & Artisan Sector',
    children: [
      'Zari and zardozi work',
      'Chikankari embroidery',
      'Woodwork',
      'Terracotta / clay products',
      'Bamboo / cane craft',
      'Handmade jewellery (terracotta jewellery, oxidised jewellery)',
      'Handmade candles',
      'Crochet / woollen products',
      'Paper craft, greeting cards',
      'Handbags, jute bags, embroidered bags',
      'Ration/vegetable/shopping bags (non-woven alternatives)​',
      'Others',
    ],
  },
  {
    parent: 'Textile & Apparel Sector',
    children: [
      'Boutique unit (stitching–cutting–embellishment)',
      'School uniform stitching unit',
      'Ladies’ garments',
      'Bedsheet/quilt/pillow cover unit',
      'ODOP textile-based products (Varanasi saree, Bhadohi carpet finishing etc.)',
      'Home linen (curtains, table cloth, sofa covers)',
      'Jute/cotton carry bags',
      'Mask/apron/hospital gown manufacturing​',
      'Others',
    ],
  },
  {
    parent: 'Agriculture & Allied Sector',
    children: [
      'Vegetable cultivation and group supply',
      'Flower cultivation (marigold, rose)',
      'Mushroom production',
      'Nursery (fruit/flower/vegetable saplings)',
      'Beekeeping (honey production)',
      'Organic manure/vermi-compost',
      'Animal feed unit',
      'Mini mill (flour/pulse grinding)',
      'Fruit–vegetable dehydration unit',
      'Fish farming',
      'Others',
    ],
  },
  {
    parent: 'Dairy & Animal Husbandry Sector',
    children: [
      'Dairy unit (2–10 cows/buffaloes)',
      'Milk collection centre',
      'Paneer/khoya/curd/ghee manufacturing',
      'Goat rearing',
      'Poultry unit (egg/broiler)',
      'Pig rearing (in specific areas)',
      'Fodder production',
      'Milk packaging and branding unit​',
      'Others',
    ],
  },
  {
    parent: 'Beauty, Wellness & Personal Services',
    children: [
      'Beauty parlour',
      'Mehndi (henna) training and services',
      'Spa / therapy unit',
      'Home-care services (home nursing, baby care training)',
      'Mobile salon / village-based services',
      'Fitness group / yoga classes​',
      'Others',
    ],
  },
  {
    parent: 'Retail & Micro Trading Sector',
    children: [
      'Grocery/provision store',
      'Stationery / general store',
      'Group sale of vegetables/fruits',
      'Fast food cart',
      'Mobile recharge shop / bill payment kiosk',
      'Jan Aushadhi/Medical Store',
      'PET shop and disposable alternatives distribution​',
      'Others',
    ],
  },
  {
    parent: 'Cleaning & Hygiene Products Sector',
    children: [
      'Phenyl/detergent manufacturing',
      'Liquid handwash',
      'Sanitizer',
      'Incense sticks and dhoop sticks',
      'Napkin / sanitary pad unit',
      'Biodegradable plate and bowl manufacturing​',
      'Others',
    ],
  },

  {
    parent: 'FMCG',
    children: [
      'Handwash',
      'Soap',
      'Floor Cleaner',
      'Detergents',
      'Air fresheners',
      'Face wash & creams',
      'Shampoo & conditioner',
      'Sponges',
      'Toothpaste & toothbrushes',
      'Broom',
      'Others',
    ],
  },
   {
    parent: 'Transport',
    children: [
      'Loader',
      'E-Rikshaw',
      'Taxi',
      'Auto',
      'Others',
    ],
  },
  {
    parent: 'Packaging & Utility Products Sector',
    children: [
      'Paper bag unit',
      'Jute bag unit',
      'Box manufacturing',
      'Recycled paper packaging unit',
      'Food-grade packaging​',
      'Others',
    ],
  },
  {
    parent: 'Prerna Canteen',
    children: [
    ],
  },
  {
    parent: 'Digital & Service Sector',
    children: [
      'Data entry / digital services',
      'CSC (Common Service Center) operations',
      'Online product sales (e-commerce)',
      'SHG product branding',
      'Social media management for local shops​',
      'Others',
    ],
  },
  {
    parent: 'Solid Waste & Green Sector',
    children: [
      'Plastic waste sorting',
      'Fuel/briquettes from waste',
      'Composting unit',
      'Recycled paper products',
      'E-waste collection micro centre​',
      'Others',
    ],
  },
  {
    parent: 'Construction & Fabrication Micro Enterprises',
    children: [
      'Brick and tiles cleaning/polishing unit',
      'Interior decoration (fabric, flowers, décor)',
      'Painting/plumbing/carpentry group',
      'POP artwork / wall decoration',
      'Others',
    ],
  },
  {
    parent: 'EDP|Entrepreneurship Development Programme ',
    children: [
     ]},
  {
    parent: 'Other​',
    children: ['Others'],
  },
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

const ChipRow = ({ value, options, onChange }) => (
  <View style={styles.chipRow}>
    {options.map((opt) => {
      const active = value === opt;
      return (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

/**
 * Parent–child sector tree used for both training received and required.
 * value: [{ parent, children: [] }]
 */
const TrainingSectorTree = ({ value, onChange }) => {
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
const toggleTrainingType = (val) => {
  setTrainingType((prev) =>
    prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val]
  );
};

  return (
    <View style={{ marginTop: 8 }}>
      {TRAINING_SECTOR_TREE.map((group) => {
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

const computeTitleFromTree = (tree, fallback) => {
  if (!Array.isArray(tree) || tree.length === 0) return fallback;
  const parent = tree[0]?.parent;
  return parent || fallback;
};

export default function ExistingEnterpriseTrainingSkillsSection({
  existingForm,
  setExistingForm,
}) {
  const update = (patch) => setExistingForm(patch);
// const [trainingLocationType, setTrainingLocationType] = useState("");
  const trainingReceived = Array.isArray(existingForm.training_received_rows)
    ? existingForm.training_received_rows
    : [];
  const trainingRequired = Array.isArray(existingForm.training_required_rows)
    ? existingForm.training_required_rows
    : [];
const [trainingType, setTrainingType] = useState([]);

  const isTrainingReceivedYes = existingForm.is_training_received === 'Yes';
  const isTrainingRequiredYes = existingForm.is_training_required === 'Yes';
  const isTrainingRequiredNo = existingForm.is_training_required === 'No';

  const updateTrainingReceived = (next) =>
    update({ training_received_rows: next });
  const updateTrainingRequired = (next) =>
    update({ training_required_rows: next });

  const toggleTrainingType = (val) => {
  setTrainingType((prev) =>
    prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val]
  );
};
  const addTrainingReceivedRow = () => {
    const row = {
      id: Date.now().toString(),
      title: 'New Training Detail',
      expanded: true,
      department: '',
      department_other: '',
      sector_tree: [],
      other_sector_detail: '',
      certificates_files: [],
    };
    updateTrainingReceived([...trainingReceived, row]);
  };

  const removeTrainingReceivedRow = (index) => {
    const next = trainingReceived.filter((_, i) => i !== index);
    updateTrainingReceived(next);
  };

  const updateTrainingReceivedRow = (index, patch) => {
    const next = trainingReceived.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    updateTrainingReceived(next);
  };

  const toggleTrainingReceivedExpand = (index) => {
    const row = trainingReceived[index];
    updateTrainingReceivedRow(index, { expanded: !row.expanded });
  };

  const addTrainingRequiredRow = () => {
    const row = {
      id: Date.now().toString(),
      title: 'New Training Requirement',
      expanded: true,
      department: '',
      department_other: '',
      sector_tree: [],
      other_sector_detail: '',
      duration: '',
      location_state: '',
      location_district: '',
      location_block: '',
      location: '',
      expected_income: '',
    };
    updateTrainingRequired([...trainingRequired, row]);
  };

  const removeTrainingRequiredRow = (index) => {
    const next = trainingRequired.filter((_, i) => i !== index);
    updateTrainingRequired(next);
  };

  const updateTrainingRequiredRow = (index, patch) => {
    const row = trainingRequired[index];
    const merged = { ...row, ...patch };

    // re-compute combined location (State, District, Block)
    const location = [
      merged.location_state || '',
      merged.location_district || '',
      merged.location_block || '',
    ]
      .map((p) => p.trim())
      .filter(Boolean)
      .join(', ');

    merged.location = location;

    const next = trainingRequired.map((r, i) =>
      i === index ? merged : r
    );
    updateTrainingRequired(next);
  };

  const toggleTrainingRequiredExpand = (index) => {
    const row = trainingRequired[index];
    updateTrainingRequiredRow(index, { expanded: !row.expanded });
  };

  const pickCertificates = async (rowIndex) => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 5,
      });
      if (res.didCancel) return;
      const assets = res.assets || [];
      const row = trainingReceived[rowIndex];
      const current = Array.isArray(row.certificates_files)
        ? row.certificates_files
        : [];
      const combined = [...current, ...assets];
      updateTrainingReceivedRow(rowIndex, {
        certificates_files: combined,
      });
    } catch (err) {
      console.warn('Certificate pick failed', err);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        6) Training / Skills Related Section
      </Text>

      {/* TRAINING RECEIVED */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Have you received any skill training?
        </Text>
        <Text style={styles.helpText}>
          Please select Yes if you have already attended any training related to
          business, skills or livelihood. You can add details of each training
          in the section below.
        </Text>
        <YesNoToggle
          value={existingForm.is_training_received || ''}
          onChange={(val) => update({ is_training_received: val })}
        />
      </View>

      {isTrainingReceivedYes && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.helpText, { marginBottom: 8 }]}>
            Please record each training separately. Click &quot;+ Add Training
            Detail&quot; to add another training.
          </Text>

          {trainingReceived.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleTrainingReceivedExpand(index)}
              >
                <Text style={styles.cardTitle}>
                  {row.title || 'New Training Detail'}
                </Text>
                <Text style={styles.cardToggle}>
                  {row.expanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeTrainingReceivedRow(index)}
                >
                  <Text style={styles.removeBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                  {/* 1) Department */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Which department did you receive the training from?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the department or organisation that
                      conducted the training.
                    </Text>
                    <ChipRow
                      value={row.department || ''}
                      options={TRAINING_DEPT_OPTIONS}
                      onChange={(val) =>
                        updateTrainingReceivedRow(index, { department: val })
                      }
                    />
                    {row.department === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify the department"
                        value={row.department_other || ''}
                        onChangeText={(v) =>
                          updateTrainingReceivedRow(index, {
                            department_other: v,
                          })
                        }
                      />
                    )}
                  </View>

                  {/* 2) Sectors and modules (tree) */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      Please select all sectors in which you have received trainings
                    </Text>
                    <Text style={styles.helpText}>
                      First tick the main business sector, then choose all
                      specific trainings you have attended under that sector.
                      You can select more than one sector.
                    </Text>

                    <TrainingSectorTree
                      value={row.sector_tree}
                      onChange={(tree) =>
                        updateTrainingReceivedRow(index, {
                          sector_tree: tree,
                          title: computeTitleFromTree(
                            tree,
                            'New Training Detail'
                          ),
                        })
                      }
                    />

                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      placeholder="If Others, please specify sector / sub-sector details here"
                      value={row.other_sector_detail || ''}
                      onChangeText={(v) =>
                        updateTrainingReceivedRow(index, {
                          other_sector_detail: v,
                        })
                      }
                    />

                    <Text style={[styles.helpText, { marginTop: 4 }]}>
                      Your selections will be saved as
                      &nbsp;&quot;[Sector: Module1, Module2]&quot; format for sending to the server.
                    </Text>
                  </View>

                  {/* 3) Certificates upload */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      3) Please upload if you have any certificates for your trainings
                    </Text>
                    <Text style={styles.helpText}>
                      You can upload photos or PDF copies of your training
                      certificates. Each file will be stored separately.
                    </Text>
                    <TouchableOpacity
                      style={styles.mediaBtn}
                      onPress={() => pickCertificates(index)}
                    >
                      <Text style={styles.mediaBtnText}>Select Certificates</Text>
                    </TouchableOpacity>
                    {Array.isArray(row.certificates_files) &&
                      row.certificates_files.length > 0 && (
                        <Text style={styles.mediaInfo}>
                          Selected: {row.certificates_files.length} file(s)
                        </Text>
                      )}
                  </View> */}

                  {/* 3) Certificates upload */}
<View style={styles.fieldBlock}>
  <Text style={styles.label}>
    Please upload if you have any certificates for your trainings  (If Have)
  </Text>
  <Text style={styles.helpText}>
    You can upload photos or PDF copies of your training certificates. Each file will be stored separately.
  </Text>
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
    {/* Upload button */}
    <TouchableOpacity
      style={styles.mediaBtn}
      onPress={() => pickCertificates(index)}
    >
      <Text style={styles.mediaBtnText}>Upload Certificates</Text>
    </TouchableOpacity>

    {/* Camera button */}
    <TouchableOpacity
      style={styles.mediaBtn}
      onPress={async () => {
        try {
          const res = await launchCamera({
            mediaType: 'photo',
          });
          if (res.didCancel) return;
          const assets = res.assets || [];
          const row = trainingReceived[index];
          const current = Array.isArray(row.certificates_files) ? row.certificates_files : [];
          const combined = [...current, ...assets];
          updateTrainingReceivedRow(index, { certificates_files: combined });
        } catch (err) {
          console.warn('Camera capture failed', err);
        }
      }}
    >
      <Text style={styles.mediaBtnText}>Camera</Text>
    </TouchableOpacity>
  </View>

  {Array.isArray(row.certificates_files) && row.certificates_files.length > 0 && (
    <Text style={styles.mediaInfo}>
      Selected: {row.certificates_files.length} file(s)
    </Text>
  )}
</View>

                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={addTrainingReceivedRow}
          >
            <Text style={styles.addBtnText}>+ Add Training Detail</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TRAINING REQUIRED */}
      <View style={[styles.fieldBlock, { marginTop: 18 }]}>
        <Text style={styles.label}>
          Do you require skill training in future?
        </Text>
        <Text style={styles.helpText}>
          Please select Yes if you are interested in taking new training to
          grow or improve your enterprise.
        </Text>
        <YesNoToggle
          value={existingForm.is_training_required || ''}
          onChange={(val) => update({ is_training_required: val })}
        />
      </View>

      {/* Training required = YES */}
      {isTrainingRequiredYes && (
        <View style={{ marginTop: 8 }}>
          <Text style={[styles.helpText, { marginBottom: 8 }]}>
            Please add each training requirement separately. This will help us
            plan suitable training for you.
          </Text>

          {trainingRequired.map((row, index) => (
            <View key={row.id || index} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleTrainingRequiredExpand(index)}
              >
                <Text style={styles.cardTitle}>
                  {row.title || 'New Training Requirement'}
                </Text>
                <Text style={styles.cardToggle}>
                  {row.expanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <View style={styles.cardHeaderBottom}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeTrainingRequiredRow(index)}
                >
                  <Text style={styles.removeBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>

              {row.expanded && (
                <View style={styles.cardBody}>
                   <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                    Which is your preferred sector for training?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select all business sectors and skill areas where
                      you want training in future.
                    </Text>

                    <TrainingSectorTree
                      value={row.sector_tree}
                      onChange={(tree) =>
                        updateTrainingRequiredRow(index, {
                          sector_tree: tree,
                          title: computeTitleFromTree(
                            tree,
                            'New Training Requirement'
                          ),
                        })
                      }
                    />

                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      placeholder="If Others, please specify sector / sub-sector details here"
                      value={row.other_sector_detail || ''}
                      onChangeText={(v) =>
                        updateTrainingRequiredRow(index, {
                          other_sector_detail: v,
                        })
                      }
                    />
                  </View>
      <View style={styles.fieldBlock}>
  <Text style={styles.label}>
    What is your preferred training type?
  </Text>

  <Text style={styles.helpText}>
    You may select one or both options.
  </Text>

  {TRAINING_TYPE_OPTIONS.map((opt) => (
    <TouchableOpacity
      key={opt}
      style={styles.checkboxRow}
      onPress={() => toggleTrainingType(opt)}
    >
      <View
        style={[
          styles.checkbox,
          trainingType.includes(opt) && styles.checkboxChecked,
        ]}
      />
      <Text style={styles.checkboxLabel}>{opt}</Text>
    </TouchableOpacity>
  ))}
</View>


                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      How many days of training are you comfortable in one slot?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the training duration that suits you best.
                    </Text>
                    <ChipRow
                      value={row.duration || ''}
                      options={TRAINING_DURATION_OPTIONS}
                      onChange={(val) =>
                        updateTrainingRequiredRow(index, { duration: val })
                      }
                    />
                  </View>

                  {/* 1) Preferred department */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                    Which is your preferred department for training?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the department or organisation from which
                      you would like to receive training.
                    </Text>
                    <ChipRow
                      value={row.department || ''}
                      options={TRAINING_DEPT_OPTIONS}
                      onChange={(val) =>
                        updateTrainingRequiredRow(index, { department: val })
                      }
                    />
                    {row.department === 'Others' && (
                      <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Please specify the department"
                        value={row.department_other || ''}
                        onChangeText={(v) =>
                          updateTrainingRequiredRow(index, {
                            department_other: v,
                          })
                        }
                      />
                    )}
                  </View>

                  {/* 2) Preferred sector(s) */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      2) Which is your preferred sector for training?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select all business sectors and skill areas where
                      you want training in future.
                    </Text>

                    <TrainingSectorTree
                      value={row.sector_tree}
                      onChange={(tree) =>
                        updateTrainingRequiredRow(index, {
                          sector_tree: tree,
                          title: computeTitleFromTree(
                            tree,
                            'New Training Requirement'
                          ),
                        })
                      }
                    />

                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      placeholder="If Others, please specify sector / sub-sector details here"
                      value={row.other_sector_detail || ''}
                      onChangeText={(v) =>
                        updateTrainingRequiredRow(index, {
                          other_sector_detail: v,
                        })
                      }
                    />
                  </View> */}

                  {/* 3) Duration */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      3) How many days of training are you comfortable with?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the training duration that suits you best.
                    </Text>
                    <ChipRow
                      value={row.duration || ''}
                      options={TRAINING_DURATION_OPTIONS}
                      onChange={(val) =>
                        updateTrainingRequiredRow(index, { duration: val })
                      }
                    />
                  </View> */}

                  {/* 4) Preferred location */}
                  {/* <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      4) What is your preferred training location?
                    </Text>
                    <Text style={styles.helpText}>
                      Please fill the State, District and Block where you would
                      like to attend the training. These will be saved together
                      as your preferred location.
                    </Text>


                    <Text style={styles.smallLabel}>District</Text>
                    <TextInput
                      style={styles.input}
                      value={row.location_district || ''}
                      onChangeText={(v) =>
                        updateTrainingRequiredRow(index, {
                          location_district: v,
                        })
                      }
                    />
                    <Text style={styles.smallLabel}>Block</Text>
                    <TextInput
                      style={styles.input}
                      value={row.location_block || ''}
                      onChangeText={(v) =>
                        updateTrainingRequiredRow(index, {
                          location_block: v,
                        })
                      }
                    />                
                    <Text style={styles.smallLabel}>Village</Text>
                    <TextInput
                      style={styles.input}
                      value={row.location_village || ''}
                      onChangeText={(v) =>
                        updateTrainingRequiredRow(index, {
                          location_village: v,
                        })
                      }
                    /> */}
                    {/* <Text style={[styles.helpText, { marginTop: 4 }]}>
                      These details will be combined as &quot;State,
                      District, Block&quot; and stored in the location field.
                    </Text> */}

                    <View style={styles.fieldBlock}>
  <Text style={styles.label}>
    What is your preferred training location?
  </Text>

  <Text style={styles.helpText}>
    Please fill the State, District and Block where you would
    like to attend the training. These will be saved together
    as your preferred location.
  </Text>

  <Text style={styles.smallLabel}>Select Location Type</Text>

  <View style={styles.input}>
    <Picker
      selectedValue={row.location_type || ""}
      onValueChange={(v) =>
        updateTrainingRequiredRow(index, {
          location_type: v,
        })
      }
    >
      <Picker.Item label="Select Location" value="" />
      <Picker.Item label="State" value="state" />
      <Picker.Item label="District" value="district" />
      <Picker.Item label="Block" value="block" />
      <Picker.Item label="Village" value="village" />
    </Picker>
  </View>
</View>

                  {/* </View> */}

                  {/* 5) Expected income */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      What is your expected income after training?
                    </Text>
                    <Text style={styles.helpText}>
                      Please select the monthly income range you are expecting
                      after successfully completing the training.
                    </Text>
                    <ChipRow
                      value={row.expected_income || ''}
                      options={EXPECTED_INCOME_OPTIONS}
                      onChange={(val) =>
                        updateTrainingRequiredRow(index, {
                          expected_income: val,
                        })
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={addTrainingRequiredRow}
          >
            <Text style={styles.addBtnText}>+ Add Training Requirement</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Training required = NO – ask about centres & industries nearby */}
      {isTrainingRequiredNo && (
        <View style={{ marginTop: 10 }}>
          {/* 1) Nearest skill centre */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              Do you know of any Skill Centres related to your enterprise?
            </Text>
            <Text style={styles.helpText}>
              Please select Yes if you are aware of any nearby skill or
              training centre.
            </Text>
            <YesNoToggle
              value={existingForm.nearest_skill_centre || ''}
              onChange={(val) => update({ nearest_skill_centre: val })}
            />
            {existingForm.nearest_skill_centre === 'Yes' && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.helpText}>
                  Please mention its location (village/town, block, district).
                </Text>
                <TextInput
                  style={styles.input}
                  value={existingForm.skill_centre_loc || ''}
                  onChangeText={(v) => update({ skill_centre_loc: v })}
                />
              </View>
            )}
          </View>

          {/* 2) Nearest industry */}
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>
              Do you know of any Industries / Industrial Sectors related to your enterprise?
            </Text>
            <Text style={styles.helpText}>
              Please select Yes if you know any nearby industrial areas,
              factories or clusters.
            </Text>
            <YesNoToggle
              value={existingForm.nearest_industry || ''}
              onChange={(val) => update({ nearest_industry: val })}
            />
            {existingForm.nearest_industry === 'Yes' && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.helpText}>
                  Please mention its location (name of industrial area, town,
                  etc.).
                </Text>
                <TextInput
                  style={styles.input}
                  value={existingForm.industry_loc || ''}
                  onChangeText={(v) => update({ industry_loc: v })}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* 22) Future expansion plan */}
      <View style={[styles.fieldBlock, { marginTop: 18 }]}>
        <Text style={styles.label}>
          What is your Future Expansion Plan (If any)?
        </Text>
        <Text style={styles.helpText}>
          Please briefly describe how you would like to grow your enterprise in
          the future (for example, new products, more workers, new markets, etc.).
        </Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          multiline
          value={existingForm.expansion_plan || ''}
          onChangeText={(v) => update({ expansion_plan: v })}
        />
      </View>

      {/* 23) Information about government schemes */}
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>
          Do you know about Govt Schemes relevant to your business?
        </Text>
        <Text style={styles.helpText}>
          Please select Yes if you are interested in learning about different
          government schemes related to your business or livelihood.
        </Text>
        <YesNoToggle
          value={existingForm.info_abt_gov_scheme || ''}
          onChange={(val) => update({ info_abt_gov_scheme: val })}
        />
      </View>
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
  smallLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
    color: '#444',
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
    // paddingVertical: 8,
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
  mediaBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  mediaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  mediaInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
},

checkbox: {
  width: 20,
  height: 20,
  borderWidth: 1.5,
  borderColor: '#666',
  borderRadius: 4,
  marginRight: 10,
  backgroundColor: '#fff',
},

checkboxChecked: {
  backgroundColor: '#d9534f', // green fill
  borderColor: '#d9534f',
},

checkboxLabel: {
  fontSize: 14,
  color: '#333',
},

});
