// src/screens/AdminDashboardProduction.jsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { getUser, clearUser } from '../../utils/auth';
import gsApi from '../../api/gsApi';
import LoaderModal from '../LoaderModal';
import BurgerMenu from '../BurgerMenu';
import LanguageToggle from '../../components/LanguageToggle';
import { LanguageContext } from '../../components/LanguageContext';
import { clearAllTemp } from '../../utils/tempStore';

// filesystem + sharing + xlsx
import RNFS from 'react-native-fs';
import ShareLib from 'react-native-share';
import XLSX from 'xlsx';

/**
 * AdminDashboardProduction — file-export capable (CSV + XLSX)
 *
 * - Uses react-native-share for file sharing
 * - Uses react-native-fs to write CSV/.xlsx files to device storage
 * - Uses xlsx to build .xlsx content, writes base64 and saves to file
 * - Shows progress modal while fetching per-member details for export
 *
 * 1:1 replacement for previous file (surgical changes only).
 */

export default function AdminDashboardProduction({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { language } = useContext(LanguageContext);
  const tStrings = {
    en: {
      headerTitle: 'Admin Dashboard',
      logout: 'Logout',
      loadingDistricts: 'Fetching district analytics...',
      totalLabel: 'Total beneficiaries recorded',
      export: 'Export',
      exportCSV: 'Export CSV',
      exportXLSX: 'Export XLSX',
      exportOptionsTitle: 'Choose export format',
      exportCancel: 'Cancel',
      back: 'Back',
      viewMembers: 'View Members',
      noData: 'No data',
      showDetails: 'Show Details',
      exportPreparing: 'Preparing export file...',
      exportSuccess: 'Export ready. Choose where to share/save the file.',
      exportFail: 'Export failed',
      progressTitle: 'Preparing export',
      progressMessage: (done, total) => `Fetched ${done} of ${total} member details...`,
    },
    hi: {
      headerTitle: 'लाभार्थी उद्यम जानकारी प्राप्त करें',
      logout: 'लॉग आउट',
      loadingDistricts: 'जिला एनालिटिक्स प्राप्त किए जा रहे हैं...',
      totalLabel: 'कुल लाभार्थी रिकॉर्डेड',
      export: 'निर्यात',
      exportCSV: 'CSV निर्यात करें',
      exportXLSX: 'XLSX निर्यात करें',
      exportOptionsTitle: 'निर्यात प्रारूप चुनें',
      exportCancel: 'रद्द करें',
      back: 'वापस',
      viewMembers: 'सदस्यों को देखें',
      noData: 'कोई डेटा नहीं',
      showDetails: 'विवरण देखें',
      exportPreparing: 'निर्यात फ़ाइल तैयार की जा रही है...',
      exportSuccess: 'निर्यात तैयार है। फ़ाइल साझा/सहेजें।',
      exportFail: 'निर्यात विफल हुआ',
      progressTitle: 'निर्यात तैयार किया जा रहा है',
      progressMessage: (done, total) => `${total} में से ${done} सदस्य विवरण लाए जा रहे हैं...`,
    },
  };
  const t = tStrings[language] || tStrings.en;

  // UI state for drilldown
  const [level, setLevel] = useState('district'); // district | block | panchayat | village | shg | members
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]); // rows for current level
  const [totalCount, setTotalCount] = useState(0);

  // enterprise counts
  const [existingEnterpriseCount, setExistingEnterpriseCount] = useState(0);
  const [newEnterpriseCount, setNewEnterpriseCount] = useState(0);
  const [noEnterpriseCount, setNoEnterpriseCount] = useState(0);

  // selected identifiers for filters
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedShg, setSelectedShg] = useState(null);

  // modal for member details
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberDetail, setMemberDetail] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // export progress UI
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportProgress, setExportProgress] = useState({ done: 0, total: 0 });
  const [exportBusyText, setExportBusyText] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) {
        navigation.replace('Login');
        return;
      }
      setUser(u);
      if (u.access) {
        gsApi.setAuthToken?.(u.access);
      }
      await loadLevel('district', 1);
    })();
  }, []);

  // Helper: normalize list responses
  const normalizeList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  // central loader for each level (page param kept for simplicity)
  const loadLevel = async (targetLevel, targetPage = 1) => {
    setLoading(true);
    setPage(targetPage);
    try {
      if (targetLevel === 'district') {
        const res = await gsApi.getRecordedBeneficiaries({
          group_by: 'district_id',
          page_size: 1000,
        });
        const data = normalizeList(res);
        const rowsOut = data.map((r) => ({
          id: r.group?.district_id ?? r.district_id,
          name:
            r.group?.district_name ||
            `District ${r.group?.district_id ?? r.district_id}`,
          count: r.count ?? 0,
        }));
        setRows(rowsOut);
        setTotalCount(rowsOut.reduce((a, b) => a + (b.count || 0), 0));
        // additionally compute enterprise interest counts by fetching raw recorded beneficiaries
        try {
          const allRecRes = await gsApi.getRecordedBeneficiaries({ page_size: 5000 });
          const allRecs = normalizeList(allRecRes);
          let existCnt = 0, newCnt = 0, noneCnt = 0;
          for (const r of allRecs) {
            const hasExisting = !!(r.existing_enterprise_id || r.existing_enterprise || r.existing_enterprise_id === 0);
            const hasNew = !!(r.new_enterprise_id || r.new_enterprise);
            const hasAnyEnterprise = hasExisting || hasNew || !!r.enterprise_id || !!r.enterprise;
            if (hasExisting) existCnt += 1;
            else if (hasNew) newCnt += 1;
            else if (!hasAnyEnterprise) noneCnt += 1;
          }
          setExistingEnterpriseCount(existCnt);
          setNewEnterpriseCount(newCnt);
          setNoEnterpriseCount(noneCnt);
        } catch (err) {
          console.warn('Failed to compute enterprise counts', err);
          setExistingEnterpriseCount(0);
          setNewEnterpriseCount(0);
          setNoEnterpriseCount(0);
        }

        // enrich district names via District lookup API
        try {
          const distRes = await gsApi.getDistricts(1, '');
          const distList = normalizeList(distRes);
          const distMap = {};
          distList.forEach(d => { if (d.id || d.district_id) distMap[String(d.id || d.district_id)] = d.name || d.district_name || d.name_en || d.title || d.display_name || d.search_name || d.district_name_en || d.name_en || d.name; });
          const rowsEnriched = rowsOut.map(r => ({ ...r, name: distMap[String(r.id)] || r.name }));
          setRows(rowsEnriched);
        } catch (err) {
          // ignore
        }


        setLevel('district');
      } else if (targetLevel === 'block') {
        const res = await gsApi.getRecordedBeneficiaries({
          group_by: 'block_id',
          district_id: selectedDistrict,
          page_size: 1000,
        });
        const data = normalizeList(res);
        const rowsOut = data.map((r) => ({
          id: r.group?.block_id ?? r.block_id,
          name:
            r.group?.block_name || `Block ${r.group?.block_id ?? r.block_id}`,
          count: r.count ?? 0,
        }));
        setRows(rowsOut);
        setTotalCount(rowsOut.reduce((a, b) => a + (b.count || 0), 0));
        setLevel('block');
      } else if (targetLevel === 'panchayat') {
        const res = await gsApi.getRecordedBeneficiaries({
          group_by: 'panchayat_id',
          block_id: selectedBlock,
          page_size: 1000,
        });
        const data = normalizeList(res);
        const rowsOut = data.map((r) => ({
          id: r.group?.panchayat_id ?? r.panchayat_id,
          name:
            r.group?.panchayat_name ||
            `Panchayat ${r.group?.panchayat_id ?? r.panchayat_id}`,
          count: r.count ?? 0,
        }));
        setRows(rowsOut);
        setTotalCount(rowsOut.reduce((a, b) => a + (b.count || 0), 0));
        setLevel('panchayat');
      } else if (targetLevel === 'village') {
        const res = await gsApi.getRecordedBeneficiaries({
          group_by: 'village_id',
          panchayat_id: selectedPanchayat,
          page_size: 1000,
        });
        const data = normalizeList(res);
        const rowsOut = data.map((r) => ({
          id: r.group?.village_id ?? r.village_id,
          name:
            r.group?.village_name ||
            `Village ${r.group?.village_id ?? r.village_id}`,
          count: r.count ?? 0,
        }));
        setRows(rowsOut);
        setTotalCount(rowsOut.reduce((a, b) => a + (b.count || 0), 0));
        setLevel('village');
      } else if (targetLevel === 'shg') {
        const blockId = selectedBlock;
        if (!blockId) {
          Alert.alert('Missing block', 'Block ID is missing for SHG listing.');
          setRows([]);
          setLevel('shg');
          return;
        }

        let shgRowsRaw = [];
        try {
          const shgRes = await gsApi.getUpsrlmShgList(blockId, { page_size: 5000 });
          shgRowsRaw = normalizeList(shgRes);
        } catch (err) {
          console.warn('Failed to fetch SHG list for block', blockId, err);
          shgRowsRaw = [];
        }

        let recRowsRaw = [];
        try {
          const recFilters = { page_size: 5000, block_id: blockId };
          if (selectedVillage) recFilters.village_id = selectedVillage;
          const recRes = await gsApi.getRecordedBeneficiaries(recFilters);
          recRowsRaw = normalizeList(recRes);
        } catch (err) {
          console.warn('Failed to fetch recorded beneficiaries for block while computing SHG counts', err);
          recRowsRaw = [];
        }

        const mapped = shgRowsRaw.map((s) => {
          const code = s.code ?? s.shg_code ?? s.lokos_shg_code ?? null;
          const count = recRowsRaw.filter((r) => String(r.lokos_shg_code) === String(code)).length;
          return {
            id: code ?? `${s.panchayatId ?? s.panchayat_id ?? 'shg'}_${s.name}`,
            name: s.name || s.name_en || code || 'SHG',
            count,
            raw: s,
          };
        });

        setRows(mapped);
        setTotalCount(mapped.reduce((a, b) => a + (b.count || 0), 0));
        setLevel('shg');
      } else if (targetLevel === 'members') {
        const shgCode =
          selectedShg?.id ??
          selectedShg?.code ??
          (selectedShg?.raw && (selectedShg.raw.code ?? selectedShg.raw.shg_code)) ??
          null;
        if (!shgCode) {
          Alert.alert('Missing SHG code', 'Cannot list members: SHG code missing.');
          setRows([]);
          setLevel('members');
          return;
        }

        let memRows = [];
        try {
          const membersRes = await gsApi.getUpsrlmShgMembers(shgCode, { page_size: 5000 });
          memRows = normalizeList(membersRes);
        } catch (err) {
          console.warn('Failed to fetch SHG members for', shgCode, err);
          memRows = [];
        }

        let recRows = [];
        try {
          const recRes = await gsApi.getRecordedBeneficiaries({ page_size: 5000, lokos_shg_code: shgCode });
          recRows = normalizeList(recRes);
        } catch (err) {
          console.warn('Failed to fetch recorded beneficiaries for SHG', shgCode, err);
          recRows = [];
        }

        const mapped = memRows.map((m) => {
          const memberCode = m.member_code ?? m.member_id ?? m.nic_member_code ?? null;
          const rec = recRows.find((r) => String(r.lokos_member_code) === String(memberCode));
          return { ...m, _isRecorded: !!rec, _recordRow: rec || null };
        });

        setRows(mapped);
        setTotalCount(mapped.length);
        setLevel('members');
      }
    } catch (err) {
      console.error('Admin analytics error', err);
      Alert.alert('Error', 'Failed to load data for this level. See console for details.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictPress = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedBlock(null);
    setSelectedPanchayat(null);
    setSelectedVillage(null);
    setSelectedShg(null);
    await loadLevel('block');
  };

  const handleBlockPress = async (blockId) => {
    setSelectedBlock(blockId);
    setSelectedPanchayat(null);
    setSelectedVillage(null);
    setSelectedShg(null);
    await loadLevel('panchayat');
  };

  const handlePanchayatPress = async (panchayatId) => {
    setSelectedPanchayat(panchayatId);
    setSelectedVillage(null);
    setSelectedShg(null);
    await loadLevel('village');
  };

  const handleVillagePress = async (villageId) => {
    setSelectedVillage(villageId);
    setSelectedShg(null);
    await loadLevel('shg');
  };

  const handleShgPress = async (shgRow) => {
    setSelectedShg(shgRow);
    await loadLevel('members');
  };

  const handleMemberPress = async (memberRow) => {
    const memberCode =
      memberRow.member_code ?? memberRow.member_id ?? memberRow.nic_member_code ?? null;
    if (!memberCode) {
      Alert.alert('No member code', 'Member code not available for details.');
      return;
    }
    try {
      setMemberLoading(true);
      setMemberModalVisible(true);
      const res = await gsApi.getEpsakhiDetailByMember(memberCode);
      setMemberDetail(res || null);
    } catch (err) {
      console.error('getEpsakhiDetailByMember error', err);
      Alert.alert('Error', 'Failed to load member details.');
      setMemberDetail(null);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleBack = async () => {
    if (level === 'district') {
      navigation.goBack();
    } else if (level === 'block') {
      setSelectedDistrict(null);
      await loadLevel('district');
    } else if (level === 'panchayat') {
      setSelectedBlock(null);
      await loadLevel('block');
    } else if (level === 'village') {
      setSelectedPanchayat(null);
      await loadLevel('panchayat');
    } else if (level === 'shg') {
      setSelectedVillage(null);
      await loadLevel('village');
    } else if (level === 'members') {
      setSelectedShg(null);
      await loadLevel('shg');
    }
  };

  // --- EXPORT HELPERS: CSV and XLSX with progress modal ---

  // Build the recorded-beneficiaries list for current scope
  const fetchRecordedForScope = async () => {
    const filters = { page_size: 5000 };
    if (level === 'block') filters.district_id = selectedDistrict;
    else if (level === 'panchayat') filters.block_id = selectedBlock;
    else if (level === 'village') filters.panchayat_id = selectedPanchayat;
    else if (level === 'shg') {
      if (selectedBlock) filters.block_id = selectedBlock;
    } else if (level === 'district') {
      if (selectedDistrict) filters.district_id = selectedDistrict;
    }
    const rec = await gsApi.getRecordedBeneficiaries(filters);
    return normalizeList(rec);
  };

  // sequentially fetch epsakhi detail for a list of recorded rows while updating progress
  const fetchDetailsSequential = async (recList) => {
    const results = [];
    setExportProgress({ done: 0, total: recList.length });
    setExportBusyText(t.progressMessage(0, recList.length));
    for (let i = 0; i < recList.length; i++) {
      const r = recList[i];
      // if shg scope and selectedShg, ensure we only include matching lokos_shg_code
      if (level === 'shg' && selectedShg) {
        const shgCode =
          selectedShg.id ??
          selectedShg.code ??
          (selectedShg.raw && (selectedShg.raw.code ?? selectedShg.raw.shg_code)) ??
          null;
        if (shgCode && String(r.lokos_shg_code) !== String(shgCode)) {
          // update progress (we skipped but count it as processed)
          setExportProgress({ done: i + 1, total: recList.length });
          setExportBusyText(t.progressMessage(i + 1, recList.length));
          results.push({ recorded: r, detail: null });
          continue;
        }
      }

      let detail = null;
      if (r.lokos_member_code) {
        try {
          detail = await gsApi.getEpsakhiDetailByMember(r.lokos_member_code);
        } catch (err) {
          detail = null;
        }
      }
      results.push({ recorded: r, detail });
      setExportProgress({ done: i + 1, total: recList.length });
      setExportBusyText(t.progressMessage(i + 1, recList.length));
    }
    return results;
  };

  // Create CSV string from fetched details (detailList = [{recorded, detail}])
  const buildCsvFromDetailList = (detailList) => {
    const header = [
      'TH_urid',
      'lokos_member_code',
      'applicant_name',
      'mobile',
      'email',
      'district_id',
      'block_id',
      'panchayat_id',
      'village_id',
      'lokos_shg_code',
      'enterprise_json',
    ];
    const lines = [header.join(',')];

    for (const item of detailList) {
      const r = item.recorded || {};
      const detailStr = item.detail ? JSON.stringify(item.detail) : '';
      const row = [
        r.TH_urid || r.id || '',
        r.lokos_member_code || '',
        `"${(r.applicant_name || '').replace(/"/g, '""')}"`,
        r.mobile || '',
        r.email || '',
        r.district_id || '',
        r.block_id || '',
        r.panchayat_id || '',
        r.village_id || '',
        r.lokos_shg_code || '',
        `"${(detailStr || '').replace(/"/g, '""')}"`,
      ];
      lines.push(row.join(','));
    }
    return lines.join('\n');
  };

  // Create XLSX workbook (sheet) from detailList (build array of objects)
  const buildXlsxWorkbook = (detailList) => {
    const rowsForXlsx = detailList.map((item) => {
      const r = item.recorded || {};
      return {
        TH_urid: r.TH_urid || r.id || '',
        lokos_member_code: r.lokos_member_code || '',
        applicant_name: r.applicant_name || '',
        mobile: r.mobile || '',
        email: r.email || '',
        district_id: r.district_id || '',
        block_id: r.block_id || '',
        panchayat_id: r.panchayat_id || '',
        village_id: r.village_id || '',
        lokos_shg_code: r.lokos_shg_code || '',
        enterprise_json: item.detail ? JSON.stringify(item.detail) : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rowsForXlsx);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RecordedBeneficiaries');
    return wb;
  };

  // write CSV file to storage and share it using react-native-share
  const writeAndShareCsvFile = async (csv, filenameBase = 'epsakhi_export') => {
    const timestamp = Date.now();
    const filename = `${filenameBase}_${timestamp}.csv`;
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    try {
      await RNFS.writeFile(path, csv, 'utf8');
      const fileUrl = Platform.OS === 'android' ? `file://${path}` : path;
      await ShareLib.open({
        url: fileUrl,
        title: 'EPsakhi CSV Export',
        type: 'text/csv',
        filename,
      });
    } finally {
      // best-effort cleanup after short delay
      setTimeout(async () => {
        try {
          const exists = await RNFS.exists(path);
          if (exists) await RNFS.unlink(path);
        } catch (e) {
          console.warn('CSV cleanup failed', e);
        }
      }, 3000);
    }
  };

  // write XLSX workbook as base64 file and share
  const writeAndShareXlsxFile = async (workbook, filenameBase = 'epsakhi_export') => {
    const timestamp = Date.now();
    const filename = `${filenameBase}_${timestamp}.xlsx`;
    // XLSX.write with type 'base64' returns base64 string
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    try {
      // write base64
      await RNFS.writeFile(path, wbout, 'base64');
      const fileUrl = Platform.OS === 'android' ? `file://${path}` : path;
      await ShareLib.open({
        url: fileUrl,
        title: 'EPsakhi XLSX Export',
        type:
          Platform.OS === 'android'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename,
      });
    } finally {
      // cleanup after short delay
      setTimeout(async () => {
        try {
          const exists = await RNFS.exists(path);
          if (exists) await RNFS.unlink(path);
        } catch (e) {
          console.warn('XLSX cleanup failed', e);
        }
      }, 3000);
    }
  };

  // Orchestrator: fetch recorded list, fetch per-member detail sequentially with progress, then write & share selected format
  const exportCurrentScope = async (format = 'csv') => {
    try {
      setExportModalVisible(true);
      setExportProgress({ done: 0, total: 0 });
      setExportBusyText(t.exportPreparing);

      // 1) fetch recorded beneficiaries list for scope
      const recList = await fetchRecordedForScope();
      if (!recList || recList.length === 0) {
        Alert.alert('No data', 'No recorded beneficiaries for this scope.');
        setExportModalVisible(false);
        return;
      }

      // 2) fetch details sequentially (with progress)
      const detailList = await fetchDetailsSequential(recList);

      // 3) build selected format and write/share
      if (format === 'csv') {
        const csv = buildCsvFromDetailList(detailList);
        await writeAndShareCsvFile(csv, `epsakhi_${level}`);
      } else {
        const workbook = buildXlsxWorkbook(detailList);
        await writeAndShareXlsxFile(workbook, `epsakhi_${level}`);
      }

      Alert.alert(t.exportSuccess);
    } catch (err) {
      console.error('exportCurrentScope error', err);
      Alert.alert(t.exportFail, (err && err.message) || 'See console for details');
    } finally {
      setExportModalVisible(false);
      setExportProgress({ done: 0, total: 0 });
      setExportBusyText('');
    }
  };

  const promptExportOptions = () => {
    Alert.alert(
      t.exportOptionsTitle,
      '',
      [
        { text: t.exportCSV, onPress: () => exportCurrentScope('csv') },
        { text: t.exportXLSX, onPress: () => exportCurrentScope('xlsx') },
        { text: t.exportCancel, style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // render row item depending on current level
  const renderRowItem = ({ item }) => {
    if (level === 'district') {
      return (
        <TouchableOpacity
          style={styles.analyticsRow}
          onPress={() => handleDistrictPress(item.id)}
        >
          <Text style={styles.analyticsName}>{item.name}</Text>
          <Text style={styles.analyticsValue}>{item.count}</Text>
        </TouchableOpacity>
      );
    }
    if (level === 'block' || level === 'panchayat' || level === 'village') {
      const onPress =
        level === 'block'
          ? () => handleBlockPress(item.id)
          : level === 'panchayat'
          ? () => handlePanchayatPress(item.id)
          : () => handleVillagePress(item.id);
      return (
        <TouchableOpacity style={styles.analyticsRow} onPress={onPress}>
          <Text style={styles.analyticsName}>{item.name}</Text>
          <Text style={styles.analyticsValue}>{item.count}</Text>
        </TouchableOpacity>
      );
    }
    if (level === 'shg') {
      return (
        <TouchableOpacity style={styles.analyticsRow} onPress={() => handleShgPress(item)}>
          <Text style={styles.analyticsName}>{item.name}</Text>
          <Text style={styles.analyticsValue}>{item.count}</Text>
        </TouchableOpacity>
      );
    }
    if (level === 'members') {
      return (
        <TouchableOpacity style={styles.analyticsRow} onPress={() => handleMemberPress(item)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.analyticsName}>
              {item.member_name || item.member_name_en || item.name || 'Member'}
              {item._isRecorded ? ' (Recorded)' : ''}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              Member Code: {String(item.member_code || item.nic_member_code || '-')}
            </Text>
          </View>
          <Text style={[styles.analyticsValue, { marginLeft: 8 }]}>
            {item._isRecorded ? 'Recorded' : 'Not recorded'}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const total = totalCount;

  const handleLogout = async () => {
    clearAllTemp();
    await clearUser();
    gsApi.setAuthToken?.(null);
    navigation.replace('Login');
  };

  const menuItems = [
    {
      label: t.logout,
      color: '#EE6969',
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LoaderModal visible={loading} message={t.loadingDistricts} />

      <View style={styles.header}>
        <LanguageToggle />
        <View style={styles.headerRight}>
          <Text style={styles.userText}>{user?.username || 'Admin'}</Text>
          <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => setMenuOpen(true)}>
            <Text style={{ fontSize: 26 }}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{marginTop: 8}}>
        <Text style={styles.title}>{t.headerTitle}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Beneficiaries having Existing Enterprise</Text>
            <Text style={styles.statNumber}>{existingEnterpriseCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Beneficiaries interested in opening new Enterprise</Text>
            <Text style={styles.statNumber}>{newEnterpriseCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Beneficiaries not interested in opening Enterprise</Text>
            <Text style={styles.statNumber}>{noEnterpriseCount}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
          <Text style={styles.secondaryButtonText}>{t.back}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryButton, { borderColor: '#2E86AB' }]} onPress={promptExportOptions}>
          <Text style={[styles.secondaryButtonText, { color: '#2E86AB' }]}>{t.export}</Text>
        </TouchableOpacity>
      </View>

      {rows.length === 0 && !loading ? (
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>{t.noData}</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={renderRowItem}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#EEE' }} />}
          ListFooterComponent={() => <View style={{ height: 24 }} />}
        />
      )}

      <Modal visible={memberModalVisible} animationType="slide" onRequestClose={() => setMemberModalVisible(false)}>
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>{t.showDetails}</Text>
            <Button title="Close" onPress={() => setMemberModalVisible(false)} />
          </View>

          {memberLoading ? (
            <ActivityIndicator size="large" />
          ) : memberDetail ? (
            <ScrollView>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Recorded Beneficiary</Text>
              <Text>TH_urid: {memberDetail.recorded_beneficiary?.TH_urid || ''}</Text>
              <Text>Name: {memberDetail.recorded_beneficiary?.applicant_name || ''}</Text>
              <Text>Mobile: {memberDetail.recorded_beneficiary?.mobile || ''}</Text>
              <Text>District: {memberDetail.recorded_beneficiary?.district_id || ''}</Text>
              <Text>Block: {memberDetail.recorded_beneficiary?.block_id || ''}</Text>
              <Text>Panchayat: {memberDetail.recorded_beneficiary?.panchayat_id || ''}</Text>
              <Text>Village: {memberDetail.recorded_beneficiary?.village_id || ''}</Text>
              <Text>lokos_shg_code: {memberDetail.recorded_beneficiary?.lokos_shg_code || ''}</Text>

              <View style={{ height: 12 }} />

              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Enterprise (if any)</Text>
              <Text>New Enterprise: {memberDetail.new_enterprise ? JSON.stringify(memberDetail.new_enterprise) : 'None'}</Text>
              <Text>Existing Enterprise: {memberDetail.existing_enterprise ? JSON.stringify(memberDetail.existing_enterprise) : 'None'}</Text>

              <View style={{ height: 12 }} />

              <TouchableOpacity style={styles.secondaryButton} onPress={() => {
                setMemberModalVisible(false);
              }}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Text>No details</Text>
          )}
        </View>
      </Modal>

      {/* EXPORT PROGRESS MODAL */}
      <Modal visible={exportModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.exportModalOverlay}>
          <View style={styles.exportModal}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>{t.progressTitle}</Text>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12 }}>{exportBusyText}</Text>
            <Text style={{ marginTop: 8 }}>{`${exportProgress.done} / ${exportProgress.total}`}</Text>
          </View>
        </View>
      </Modal>

      <BurgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menuItems={menuItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'left',
    color: '#EE6969',
  },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F9ECEC',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
  },
  totalNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#EE6969',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },
  analyticsName: { fontSize: 14, flex: 1, paddingRight: 8 },
  analyticsValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  secondaryButton: {
    borderColor: '#EE6969',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#EE6969',
    fontWeight: '500',
  },
  exportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  statCard: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#F6F8FB', alignItems: 'center', marginHorizontal: 6, minHeight: 88, justifyContent: 'center' },
  statTitle: { fontSize: 12, color: '#333', textAlign: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#EE6969', marginTop: 8 },
  exportModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
});
