import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert('Error', 'Ingrese su nombre de usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const success = await login(loginInput.trim(), password);

      if (!success) {
        Alert.alert(
          'Error de acceso',
          'Credenciales inválidas o no tienes permisos para acceder a esta aplicación.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={stylesLogin.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={stylesLogin.content}>
        <View style={stylesLogin.header}>
          <Text style={stylesLogin.title}>SIVEC</Text>
          <Text style={stylesLogin.subtitle}>Control de Vehículos</Text>
        </View>

        <View style={stylesLogin.form}>
          <View style={stylesLogin.inputContainer}>
            <Text style={stylesLogin.inputLabel}>USUARIO</Text>
            <TextInput
              style={stylesLogin.input}
              placeholder="Nombre de usuario"
              value={loginInput}
              onChangeText={setLoginInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#A3A3A3"
            />
          </View>

          <View style={stylesLogin.inputContainer}>
            <Text style={stylesLogin.inputLabel}>CONTRASEÑA</Text>
            <TextInput
              style={stylesLogin.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor="#A3A3A3"
            />
          </View>

          <TouchableOpacity
            style={[stylesLogin.button, loading && stylesLogin.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={stylesLogin.buttonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={stylesLogin.footer}>
          <View style={stylesLogin.divider} />
          <Text style={stylesLogin.footerText}>
            Si olvidaste tu usuario o contraseña, contacta con tu jefe de yarda
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const stylesLogin = RNStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 34,
    color: '#0A0A0A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B6B',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
    marginBottom: 8,
  },
  input: {
    fontSize: 15,
    color: '#0A0A0A',
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default LoginScreen;
