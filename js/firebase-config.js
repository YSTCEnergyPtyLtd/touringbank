// ============================================
// Firebase 配置文件
// ============================================
// 
// 重要提示：请按照以下步骤配置Firebase
// 
// 1. 访问 Firebase Console: https://console.firebase.google.com/
// 2. 创建新项目或选择现有项目
// 3. 在项目设置中找到您的Web应用配置
// 4. 将下面的配置信息替换为您的实际配置
// 5. 在Firebase Console中启用 Authentication > Sign-in method > Email/Password
// 
// ============================================

// TODO: 将下面的配置替换为您从Firebase Console获取的配置
const firebaseConfig = {
    apiKey: "AIzaSyCM0sBKP_WtljM6tb37CfXH8vtB5eKy9CE",
    authDomain: "touringbank.firebaseapp.com",
    projectId: "touringbank",
    storageBucket: "touringbank.firebasestorage.app",
    messagingSenderId: "805098157746",
    appId: "1:805098157746:web:2e6dd567cf9546d1f57bab",
    measurementId: "G-EZ8LPLFSF1"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);

// 获取Auth实例
const auth = firebase.auth();
const db = firebase.firestore();

// 设置语言为中文
auth.languageCode = 'zh-CN';

console.log('Firestore已初始化');
console.log('Firebase已初始化');
