
import React, { useState, useCallback, useMemo } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { HomeScreen } from './components/screens/HomeScreen';
import { EmotionDataScreen } from './components/screens/EmotionDataScreen';
import { ChallengesScreen } from './components/screens/ChallengesScreen';
import { ZenRoomScreen } from './components/screens/ZenRoomScreen';
import { EventsScreen } from './components/screens/EventsScreen';
import { Modal } from './components/Modal';
import { EmotionMapModule } from './components/modules/EmotionMapModule';
import { SmartBreakModule } from './components/modules/SmartBreakModule';
import { ZenRoomModule } from './components/modules/ZenRoomModule';
import { Mission5Module } from './components/modules/Mission5Module';
import { HappyWeekModule } from './components/modules/HappyWeekModule';
import { StatisticsModule } from './components/modules/StatisticsModule';
import { Toast, ToastData } from './components/Toast';
import { Screen, ModuleType, AppDataItem, Emotion } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>('home');
    const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
    const [appData, setAppData] = useState<AppDataItem[]>([]);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [happyPoints, setHappyPoints] = useState(0);

    const addToast = useCallback((message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
        audioService.playSound('notification');
    }, []);

    const recordActivity = useCallback((type: AppDataItem['type'], content: string) => {
        if (!userName) return;
        const newActivity: AppDataItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userName,
            type,
            content,
        };
        setAppData(prev => [...prev, newActivity]);
    }, [userName]);

    const handleLogin = (name: string) => {
        setUserName(name);
        const newLogin: AppDataItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userName: name,
            type: 'student_login',
            content: `${name} đã đăng nhập.`,
        };
        setAppData(prev => [...prev, newLogin]);
        addToast(`Chào mừng ${name}!`);
        audioService.playSound('success');
    };
    
    const openModule = (moduleType: ModuleType) => {
        setActiveModule(moduleType);
        audioService.playSound('click');
    };

    const closeModule = () => {
        setActiveModule(null);
        audioService.playSound('click');
    };
    
    const handleRecordEmotion = (emotion: Emotion) => {
        if (!userName) return;
        const newEmotionRecord: AppDataItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userName,
            type: 'emotion_record',
            emotion: emotion,
            content: `Đã ghi nhận cảm xúc: ${emotion}`
        };
        setAppData(prev => [...prev, newEmotionRecord]);
        addToast("Cảm ơn bạn đã chia sẻ cảm xúc! 😊");
        audioService.playSound('happy');
        closeModule();
    };

    const updateHappyPoints = () => {
        setHappyPoints(prev => prev + 10);
        addToast("Bạn nhận được 10 điểm hạnh phúc! ✨");
    };

    const studentLogins = useMemo(() => {
        const logins = appData.filter(item => item.type === 'student_login');
        const uniqueStudents = [...new Set(logins.map(item => item.userName))];
        return uniqueStudents;
    }, [appData]);

    const renderScreen = () => {
        const emotionRecords = appData.filter(item => item.type === 'emotion_record');
        switch (activeScreen) {
            case 'home':
                return <HomeScreen openModule={openModule} appData={appData} emotionRecords={emotionRecords} />;
            case 'emotion-data':
                return <EmotionDataScreen appData={appData} />;
            case 'challenges':
                return <ChallengesScreen recordActivity={recordActivity} addToast={addToast} />;
            case 'zen-room':
                return <ZenRoomScreen addToast={addToast} />;
            case 'events':
                return <EventsScreen addToast={addToast} studentLogins={studentLogins} />;
            default:
                return <HomeScreen openModule={openModule} appData={appData} emotionRecords={emotionRecords} />;
        }
    };
    
    const renderModule = () => {
        if (!activeModule) return null;
        switch (activeModule) {
            case 'emotion-map':
                return <EmotionMapModule 
                            onRecordEmotion={handleRecordEmotion} 
                            onClose={closeModule} 
                            onViewData={() => { closeModule(); setActiveScreen('emotion-data'); }} 
                        />;
            case 'smart-break':
                return <SmartBreakModule onClose={closeModule} addToast={addToast} />;
            case 'zen-room':
                 return <ZenRoomModule 
                            onClose={closeModule} 
                            recordActivity={recordActivity} 
                            addToast={addToast} 
                            updateHappyPoints={updateHappyPoints} 
                        />;
            case 'mission-5':
                return <Mission5Module onClose={closeModule} addToast={addToast} />;
            case 'happy-week':
                return <HappyWeekModule onClose={closeModule} addToast={addToast} openModule={openModule} />;
            case 'statistics':
                return <StatisticsModule onClose={closeModule} appData={appData} userName={userName || ''} addToast={addToast} />;
            default:
                return null;
        }
    };

    if (!userName) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div id="main-app" className="min-h-full flex flex-col">
            <Header userName={userName} activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            <main className="flex-1 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {renderScreen()}
                </div>
            </main>
            <Modal isOpen={!!activeModule} onClose={closeModule}>
                {renderModule()}
            </Modal>
            <footer className="bg-gray-800 text-white py-4 px-4 text-center">
                <p>© 2025 Happy Mind School</p>
            </footer>
            <Toast toasts={toasts} />
        </div>
    );
};

export default App;