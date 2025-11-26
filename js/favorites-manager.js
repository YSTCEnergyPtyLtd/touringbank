// ============================================
// Firestore 收藏管理模块
// ============================================
// 
// 此模块负责管理用户的收藏项目，使用 Firestore 云端存储
// 数据结构: favorites/{userId}/projects/{projectName}
//

const favoritesManager = {
    // 获取当前用户
    getCurrentUser() {
        return firebase.auth().currentUser;
    },

    // 获取 Firestore 引用
    getFirestore() {
        return firebase.firestore();
    },

    // 获取用户的收藏集合引用
    getUserFavoritesRef(userId) {
        if (!userId) {
            const user = this.getCurrentUser();
            if (!user) return null;
            userId = user.uid;
        }
        return this.getFirestore().collection('favorites').doc(userId).collection('projects');
    },

    // 添加收藏
    async addFavorite(projectData) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                alert('请先登录后再收藏项目');
                window.location.href = 'Login.html';
                return false;
            }

            const favRef = this.getUserFavoritesRef(user.uid);

            // 使用项目名称作为文档 ID
            const docRef = favRef.doc(projectData.name);

            // 添加时间戳
            const favoriteData = {
                ...projectData,
                dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
                userId: user.uid
            };

            await docRef.set(favoriteData);
            console.log('收藏成功:', projectData.name);
            return true;
        } catch (error) {
            console.error('添加收藏失败:', error);
            alert('收藏失败，请稍后重试');
            return false;
        }
    },

    // 移除收藏
    async removeFavorite(projectName) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                alert('请先登录');
                return false;
            }

            const favRef = this.getUserFavoritesRef(user.uid);
            await favRef.doc(projectName).delete();
            console.log('移除收藏成功:', projectName);
            return true;
        } catch (error) {
            console.error('移除收藏失败:', error);
            alert('移除失败，请稍后重试');
            return false;
        }
    },

    // 检查是否已收藏
    async isFavorite(projectName) {
        try {
            const user = this.getCurrentUser();
            if (!user) return false;

            const favRef = this.getUserFavoritesRef(user.uid);
            const doc = await favRef.doc(projectName).get();
            return doc.exists;
        } catch (error) {
            console.error('检查收藏状态失败:', error);
            return false;
        }
    },

    // 获取所有收藏
    async getAllFavorites() {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                console.log('用户未登录，返回空列表');
                return [];
            }

            const favRef = this.getUserFavoritesRef(user.uid);
            const snapshot = await favRef.orderBy('dateAdded', 'desc').get();

            const favorites = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // 将 Firestore Timestamp 转换为 ISO 字符串
                if (data.dateAdded && data.dateAdded.toDate) {
                    data.dateAdded = data.dateAdded.toDate().toISOString();
                }
                favorites.push(data);
            });

            console.log('获取收藏列表成功，共', favorites.length, '个项目');
            return favorites;
        } catch (error) {
            console.error('获取收藏列表失败:', error);
            return [];
        }
    },

    // 获取收藏数量
    async getFavoritesCount() {
        try {
            const user = this.getCurrentUser();
            if (!user) return 0;

            const favRef = this.getUserFavoritesRef(user.uid);
            const snapshot = await favRef.get();
            return snapshot.size;
        } catch (error) {
            console.error('获取收藏数量失败:', error);
            return 0;
        }
    },

    // 实时监听收藏变化（可选功能）
    onFavoritesChange(callback) {
        const user = this.getCurrentUser();
        if (!user) {
            callback([]);
            return null;
        }

        const favRef = this.getUserFavoritesRef(user.uid);
        // 返回 unsubscribe 函数
        return favRef.orderBy('dateAdded', 'desc').onSnapshot(snapshot => {
            const favorites = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.dateAdded && data.dateAdded.toDate) {
                    data.dateAdded = data.dateAdded.toDate().toISOString();
                }
                favorites.push(data);
            });
            callback(favorites);
        }, error => {
            console.error('监听收藏变化失败:', error);
            callback([]);
        });
    }
};

// 导出到全局作用域
window.favoritesManager = favoritesManager;

console.log('Favorites Manager 已加载');
