// .\src\screens\LoginScreen.jsx
import React, { useContext } from "react";
import LoginForm from "../screens/LoginForm";
import gsApi from "../api/gsApi";
import { saveUser } from "../utils/auth";
import { View, StyleSheet } from "react-native";
import LanguageToggle from "../components/LanguageToggle"; 
import { LanguageContext } from "../components/LanguageContext"; 

export default function LoginScreen({ navigation }) {
  const { language } = useContext(LanguageContext);

  const handleLogin = async (username, password) => {
    const res = await gsApi.login(username, password);
    return res; 
  };

  const handleSuccess = async (user) => {
    await saveUser(user);
    const role = String(user.role || "").toLowerCase();
    if (role === "crp") navigation.replace("CRPDashboard");
    else navigation.replace("AdminDashboard");
  };

  return (
    <View style={styles.container}>
      
      <LanguageToggle style={{ marginBottom: 20 }} />

      <LoginForm
        title="Enterprise Sakhi Registration"
        buttonLabel="Sign In"
        roles={["CRP", "Admin"]}
        enableCaptcha={true}
        onLogin={handleLogin}
        onSuccess={handleSuccess}
        language={language} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    paddingHorizontal: 16,
  },
});
