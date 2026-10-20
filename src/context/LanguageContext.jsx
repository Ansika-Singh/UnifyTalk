import { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext(null);

const LANGUAGES = [
  { code:'en', label:'English', flag:'🇬🇧' },
  { code:'hi', label:'हिन्दी', flag:'🇮🇳' },
  { code:'bn', label:'বাংলা', flag:'🇮🇳' },
  { code:'ta', label:'தமிழ்', flag:'🇮🇳' },
  { code:'te', label:'తెలుగు', flag:'🇮🇳' },
  { code:'kn', label:'ಕನ್ನಡ', flag:'🇮🇳' },
  { code:'or', label:'ଓଡ଼ିଆ', flag:'🇮🇳' },
  { code:'mr', label:'मराठी', flag:'🇮🇳' },
];

const STRINGS = {
  en: {
    welcomeBack:'Welcome Back', joinUs:'Join UnifyTalk',
    signInSub:'Sign in to access your personalized accessibility platform.',
    registerSub:'Create your account and start communicating without barriers.',
    signIn:'Sign In', createAccount:'Create Account',
    fullName:'Full Name', email:'Email Address', password:'Password',
    namePlaceholder:'Enter your full name', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'Enter your password', passwordRegPlaceholder:'At least 6 characters',
    accessibilityNeed:'Accessibility Need',
    none:'None', deaf:'Deaf', mute:'Mute', blind:'Blind', lowVision:'Low Vision',
    signInBtn:'🔐 Sign In', createBtn:'🚀 Create Account', wait:'⏳ Please wait…',
    noAccount:"Don't have an account?", signUpFree:'Sign up free',
    haveAccount:'Already have an account?', signInLink:'Sign in',
    nameRequired:'Name is required', passwordMin:'Password must be at least 6 characters',
    welcomeMsg:'🎉 Welcome back to UnifyTalk!', createdMsg:'🎉 Account created! Welcome to UnifyTalk!',
    genericError:'Something went wrong. Please try again.',
    selectLanguage:'Select Language', home:'Home', chat:'Chat', pictograms:'Pictograms',
    phrases:'Phrases', signAI:'Sign AI', screenReader:'Screen Reader',
    community:'Community', symptoms:'Symptoms', emergency:'Emergency',
    dashboard:'Dashboard', login:'Login', logout:'Logout', settings:'Settings',
    send:'Send', speak:'Speak', translate:'Translate', clear:'Clear',
    yourActivity:'Your Activity', chatSessions:'Chat Sessions', pictogramSessions:'Pictogram Sessions',
    signSessions:'Sign Sessions', sosAlerts:'SOS Alerts', symptomReports:'Symptom Reports',
    totalActivities:'Total Activities', achievements:'Achievements', quickAccess:'Quick Access',
    largeText:'Large Text', theme:'Theme', switchBtn:'Switch',
  },
  hi: {
    welcomeBack:'वापसी पर स्वागत है', joinUs:'UnifyTalk में शामिल हों',
    signInSub:'अपने व्यक्तिगत सुलभता प्लेटफ़ॉर्म तक पहुँचने के लिए साइन इन करें।',
    registerSub:'अपना खाता बनाएं और बिना बाधा संवाद शुरू करें।',
    signIn:'साइन इन', createAccount:'खाता बनाएं',
    fullName:'पूरा नाम', email:'ईमेल पता', password:'पासवर्ड',
    namePlaceholder:'अपना पूरा नाम दर्ज करें', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'अपना पासवर्ड दर्ज करें', passwordRegPlaceholder:'कम से कम 6 अक्षर',
    accessibilityNeed:'सुलभता आवश्यकता',
    none:'कोई नहीं', deaf:'बधिर', mute:'मूक', blind:'अंधा', lowVision:'कम दृष्टि',
    signInBtn:'🔐 साइन इन', createBtn:'🚀 खाता बनाएं', wait:'⏳ कृपया प्रतीक्षा करें…',
    noAccount:'खाता नहीं है?', signUpFree:'मुफ़्त साइन अप करें',
    haveAccount:'पहले से खाता है?', signInLink:'साइन इन करें',
    nameRequired:'नाम आवश्यक है', passwordMin:'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    welcomeMsg:'🎉 UnifyTalk में वापसी!', createdMsg:'🎉 खाता बनाया गया! UnifyTalk में स्वागत है!',
    genericError:'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
    selectLanguage:'भाषा चुनें', home:'होम', chat:'चैट', pictograms:'चित्रलेख',
    phrases:'वाक्यांश', signAI:'सांकेतिक भाषा', screenReader:'स्क्रीन रीडर',
    community:'समुदाय', symptoms:'लक्षण', emergency:'आपातकालीन',
    dashboard:'डैशबोर्ड', login:'लॉगिन', logout:'लॉगआउट', settings:'सेटिंग्स',
    send:'भेजें', speak:'बोलें', translate:'अनुवाद', clear:'साफ़ करें',
    yourActivity:'आपकी गतिविधि', chatSessions:'चैट सत्र', pictogramSessions:'चित्रलेख सत्र',
    signSessions:'संकेत सत्र', sosAlerts:'SOS अलर्ट', symptomReports:'लक्षण रिपोर्ट',
    totalActivities:'कुल गतिविधियाँ', achievements:'उपलब्धियाँ', quickAccess:'त्वरित पहुँच',
    largeText:'बड़ा टेक्स्ट', theme:'थीम', switchBtn:'बदलें',
  },
  bn: {
    welcomeBack:'ফিরে আসার জন্য স্বাগতম', joinUs:'UnifyTalk-এ যোগ দিন',
    signInSub:'আপনার ব্যক্তিগত অ্যাক্সেসিবিলিটি প্ল্যাটফর্মে সাইন ইন করুন।',
    registerSub:'আপনার অ্যাকাউন্ট তৈরি করুন এবং বাধা ছাড়াই যোগাযোগ শুরু করুন।',
    signIn:'সাইন ইন', createAccount:'অ্যাকাউন্ট তৈরি করুন',
    fullName:'পুরো নাম', email:'ইমেল ঠিকানা', password:'পাসওয়ার্ড',
    namePlaceholder:'আপনার পুরো নাম লিখুন', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'আপনার পাসওয়ার্ড লিখুন', passwordRegPlaceholder:'কমপক্ষে ৬টি অক্ষর',
    accessibilityNeed:'অ্যাক্সেসিবিলিটি প্রয়োজন',
    none:'কোনটি নয়', deaf:'বধির', mute:'নির্বাক', blind:'অন্ধ', lowVision:'কম দৃষ্টি',
    signInBtn:'🔐 সাইন ইন', createBtn:'🚀 অ্যাকাউন্ট তৈরি', wait:'⏳ অনুগ্রহ করে অপেক্ষা করুন…',
    noAccount:'অ্যাকাউন্ট নেই?', signUpFree:'বিনামূল্যে সাইন আপ',
    haveAccount:'ইতিমধ্যে অ্যাকাউন্ট আছে?', signInLink:'সাইন ইন করুন',
    nameRequired:'নাম প্রয়োজন', passwordMin:'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    welcomeMsg:'🎉 UnifyTalk-এ স্বাগতম!', createdMsg:'🎉 অ্যাকাউন্ট তৈরি হয়েছে!',
    genericError:'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।',
    selectLanguage:'ভাষা নির্বাচন', home:'হোম', chat:'চ্যাট', pictograms:'চিত্রলিপি',
    phrases:'বাক্যাংশ', signAI:'ইশারা ভাষা', screenReader:'স্ক্রিন রিডার',
    community:'সম্প্রদায়', symptoms:'লক্ষণ', emergency:'জরুরি',
    dashboard:'ড্যাশবোর্ড', login:'লগইন', logout:'লগআউট', settings:'সেটিংস',
    send:'পাঠান', speak:'বলুন', translate:'অনুবাদ', clear:'মুছুন',
    yourActivity:'আপনার কার্যকলাপ', chatSessions:'চ্যাট সেশন', pictogramSessions:'চিত্র সেশন',
    signSessions:'সংকেত সেশন', sosAlerts:'SOS সতর্কতা', symptomReports:'লক্ষণ রিপোর্ট',
    totalActivities:'মোট কার্যকলাপ', achievements:'অর্জন', quickAccess:'দ্রুত অ্যাক্সেস',
    largeText:'বড় টেক্সট', theme:'থিম', switchBtn:'পরিবর্তন',
  },
  ta: {
    welcomeBack:'மீண்டும் வரவேற்கிறோம்', joinUs:'UnifyTalk-இல் சேரவும்',
    signInSub:'உங்கள் அணுகல் தளத்தில் உள்நுழையவும்.',
    registerSub:'உங்கள் கணக்கை உருவாக்கி தடையின்றி தொடர்பு கொள்ளுங்கள்.',
    signIn:'உள்நுழை', createAccount:'கணக்கு உருவாக்கு',
    fullName:'முழு பெயர்', email:'மின்னஞ்சல்', password:'கடவுச்சொல்',
    namePlaceholder:'உங்கள் முழு பெயர்', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'கடவுச்சொல் உள்ளிடவும்', passwordRegPlaceholder:'குறைந்தது 6 எழுத்துகள்',
    accessibilityNeed:'அணுகல் தேவை',
    none:'இல்லை', deaf:'செவிடு', mute:'ஊமை', blind:'பார்வையற்ற', lowVision:'குறைந்த பார்வை',
    signInBtn:'🔐 உள்நுழை', createBtn:'🚀 கணக்கு உருவாக்கு', wait:'⏳ காத்திருங்கள்…',
    noAccount:'கணக்கு இல்லையா?', signUpFree:'இலவசமாக பதிவு செய்யவும்',
    haveAccount:'ஏற்கனவே கணக்கு உள்ளதா?', signInLink:'உள்நுழையவும்',
    nameRequired:'பெயர் தேவை', passwordMin:'கடவுச்சொல் 6 எழுத்துகளாவது இருக்க வேண்டும்',
    welcomeMsg:'🎉 மீண்டும் வரவேற்கிறோம்!', createdMsg:'🎉 கணக்கு உருவாக்கப்பட்டது!',
    genericError:'ஏதோ தவறு. மீண்டும் முயற்சிக்கவும்.',
    selectLanguage:'மொழி தேர்வு', home:'முகப்பு', chat:'அரட்டை', pictograms:'சின்னங்கள்',
    phrases:'சொற்றொடர்கள்', signAI:'சைகை மொழி', screenReader:'திரை வாசிப்பான்',
    community:'சமூகம்', symptoms:'அறிகுறிகள்', emergency:'அவசரநிலை',
    dashboard:'டாஷ்போர்டு', login:'உள்நுழை', logout:'வெளியேறு', settings:'அமைப்புகள்',
    send:'அனுப்பு', speak:'பேசு', translate:'மொழிபெயர்', clear:'அழி',
    yourActivity:'உங்கள் செயல்பாடு', chatSessions:'அரட்டை அமர்வுகள்', pictogramSessions:'சின்ன அமர்வுகள்',
    signSessions:'சைகை அமர்வுகள்', sosAlerts:'SOS எச்சரிக்கைகள்', symptomReports:'அறிகுறி அறிக்கைகள்',
    totalActivities:'மொத்த செயல்பாடுகள்', achievements:'சாதனைகள்', quickAccess:'விரைவு அணுகல்',
    largeText:'பெரிய எழுத்து', theme:'தீம்', switchBtn:'மாற்று',
  },
  te: {
    welcomeBack:'తిరిగి స్వాగతం', joinUs:'UnifyTalk లో చేరండి',
    signInSub:'మీ యాక్సెసిబిలిటీ ప్లాట్‌ఫారమ్‌లో సైన్ ఇన్ చేయండి.',
    registerSub:'మీ ఖాతాను సృష్టించి అడ్డంకులు లేకుండా కమ్యూనికేట్ చేయండి.',
    signIn:'సైన్ ఇన్', createAccount:'ఖాతా సృష్టించు',
    fullName:'పూర్తి పేరు', email:'ఇమెయిల్', password:'పాస్‌వర్డ్',
    namePlaceholder:'మీ పూర్తి పేరు', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'పాస్‌వర్డ్ నమోదు చేయండి', passwordRegPlaceholder:'కనీసం 6 అక్షరాలు',
    accessibilityNeed:'యాక్సెసిబిలిటీ అవసరం',
    none:'ఏమీ లేదు', deaf:'చెవిటి', mute:'మూగ', blind:'గ్రుడ్డి', lowVision:'తక్కువ దృష్టి',
    signInBtn:'🔐 సైన్ ఇన్', createBtn:'🚀 ఖాతా సృష్టించు', wait:'⏳ దయచేసి వేచి ఉండండి…',
    noAccount:'ఖాతా లేదా?', signUpFree:'ఉచితంగా సైన్ అప్',
    haveAccount:'ఇప్పటికే ఖాతా ఉందా?', signInLink:'సైన్ ఇన్',
    nameRequired:'పేరు అవసరం', passwordMin:'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు',
    welcomeMsg:'🎉 తిరిగి స్వాగతం!', createdMsg:'🎉 ఖాతా సృష్టించబడింది!',
    genericError:'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.',
    selectLanguage:'భాష ఎంచుకోండి', home:'హోమ్', chat:'చాట్', pictograms:'చిత్రాలు',
    phrases:'పదబంధాలు', signAI:'సంకేత భాష', screenReader:'స్క్రీన్ రీడర్',
    community:'సమాజం', symptoms:'లక్షణాలు', emergency:'అత్యవసరం',
    dashboard:'డ్యాష్‌బోర్డ్', login:'లాగిన్', logout:'లాగౌట్', settings:'సెట్టింగ్‌లు',
    send:'పంపు', speak:'మాట్లాడు', translate:'అనువాదం', clear:'తుడిచివేయు',
    yourActivity:'మీ కార్యాచరణ', chatSessions:'చాట్ సెషన్‌లు', pictogramSessions:'చిత్ర సెషన్‌లు',
    signSessions:'సంకేత సెషన్‌లు', sosAlerts:'SOS హెచ్చరికలు', symptomReports:'లక్షణ నివేదికలు',
    totalActivities:'మొత్తం కార్యకలాపాలు', achievements:'సాధనలు', quickAccess:'త్వరిత ప్రాప్యత',
    largeText:'పెద్ద టెక్స్ట్', theme:'థీమ్', switchBtn:'మార్చు',
  },
  kn: {
    welcomeBack:'ಮರಳಿ ಸ್ವಾಗತ', joinUs:'UnifyTalk ಗೆ ಸೇರಿ',
    signInSub:'ನಿಮ್ಮ ಪ್ರವೇಶಿಸುವಿಕೆ ವೇದಿಕೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    registerSub:'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ ಮತ್ತು ಅಡೆತಡೆಗಳಿಲ್ಲದೆ ಸಂವಹನ ಮಾಡಿ.',
    signIn:'ಸೈನ್ ಇನ್', createAccount:'ಖಾತೆ ರಚಿಸಿ',
    fullName:'ಪೂರ್ಣ ಹೆಸರು', email:'ಇಮೇಲ್', password:'ಪಾಸ್‌ವರ್ಡ್',
    namePlaceholder:'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ', passwordRegPlaceholder:'ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು',
    accessibilityNeed:'ಪ್ರವೇಶಿಸುವಿಕೆ ಅಗತ್ಯ',
    none:'ಯಾವುದೂ ಇಲ್ಲ', deaf:'ಕಿವುಡ', mute:'ಮೂಕ', blind:'ಕುರುಡ', lowVision:'ಕಡಿಮೆ ದೃಷ್ಟಿ',
    signInBtn:'🔐 ಸೈನ್ ಇನ್', createBtn:'🚀 ಖಾತೆ ರಚಿಸಿ', wait:'⏳ ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ…',
    noAccount:'ಖಾತೆ ಇಲ್ಲವೇ?', signUpFree:'ಉಚಿತವಾಗಿ ಸೈನ್ ಅಪ್',
    haveAccount:'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?', signInLink:'ಸೈನ್ ಇನ್',
    nameRequired:'ಹೆಸರು ಅಗತ್ಯ', passwordMin:'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರ',
    welcomeMsg:'🎉 ಮರಳಿ ಸ್ವಾಗತ!', createdMsg:'🎉 ಖಾತೆ ರಚಿಸಲಾಗಿದೆ!',
    genericError:'ಏನೋ ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    selectLanguage:'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ', home:'ಮುಖಪುಟ', chat:'ಚಾಟ್', pictograms:'ಚಿತ್ರಗಳು',
    phrases:'ನುಡಿಗಟ್ಟುಗಳು', signAI:'ಸಂಜ್ಞೆ ಭಾಷೆ', screenReader:'ಸ್ಕ್ರೀನ್ ರೀಡರ್',
    community:'ಸಮುದಾಯ', symptoms:'ಲಕ್ಷಣಗಳು', emergency:'ತುರ್ತು',
    dashboard:'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', login:'ಲಾಗಿನ್', logout:'ಲಾಗೌಟ್', settings:'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    send:'ಕಳುಹಿಸಿ', speak:'ಮಾತನಾಡಿ', translate:'ಅನುವಾದ', clear:'ಅಳಿಸಿ',
    yourActivity:'ನಿಮ್ಮ ಚಟುವಟಿಕೆ', chatSessions:'ಚಾಟ್ ಅವಧಿಗಳು', pictogramSessions:'ಚಿತ್ರ ಅವಧಿಗಳು',
    signSessions:'ಸಂಜ್ಞೆ ಅವಧಿಗಳು', sosAlerts:'SOS ಎಚ್ಚರಿಕೆಗಳು', symptomReports:'ಲಕ್ಷಣ ವರದಿಗಳು',
    totalActivities:'ಒಟ್ಟು ಚಟುವಟಿಕೆಗಳು', achievements:'ಸಾಧನೆಗಳು', quickAccess:'ತ್ವರಿತ ಪ್ರವೇಶ',
    largeText:'ದೊಡ್ಡ ಪಠ್ಯ', theme:'ಥೀಮ್', switchBtn:'ಬದಲಾಯಿಸಿ',
  },
  or: {
    welcomeBack:'ପୁଣି ସ୍ୱାଗତ', joinUs:'UnifyTalk ରେ ଯୋଗ ଦିଅନ୍ତୁ',
    signInSub:'ଆପଣଙ୍କ ଆକ୍ସେସିବିଲିଟି ପ୍ଲାଟଫର୍ମରେ ସାଇନ ଇନ କରନ୍ତୁ।',
    registerSub:'ଆପଣଙ୍କ ଆକାଉଣ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ ଏବଂ ବାଧା ବିନା ଯୋଗାଯୋଗ କରନ୍ତୁ।',
    signIn:'ସାଇନ ଇନ', createAccount:'ଆକାଉଣ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ',
    fullName:'ପୂରା ନାମ', email:'ଇମେଲ', password:'ପାସୱାର୍ଡ',
    namePlaceholder:'ଆପଣଙ୍କ ପୂରା ନାମ', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'ପାସୱାର୍ଡ ଦିଅନ୍ତୁ', passwordRegPlaceholder:'ଅତି କମରେ ୬ଟି ଅକ୍ଷର',
    accessibilityNeed:'ଆକ୍ସେସିବିଲିଟି ଆବଶ୍ୟକତା',
    none:'କିଛି ନାହିଁ', deaf:'ବଧିର', mute:'ମୂକ', blind:'ଅନ୍ଧ', lowVision:'କମ ଦୃଷ୍ଟି',
    signInBtn:'🔐 ସାଇନ ଇନ', createBtn:'🚀 ଆକାଉଣ୍ଟ ସୃଷ୍ଟି', wait:'⏳ ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ…',
    noAccount:'ଆକାଉଣ୍ଟ ନାହିଁ?', signUpFree:'ମାଗଣାରେ ସାଇନ ଅପ',
    haveAccount:'ପୂର୍ବରୁ ଆକାଉଣ୍ଟ ଅଛି?', signInLink:'ସାଇନ ଇନ କରନ୍ତୁ',
    nameRequired:'ନାମ ଆବଶ୍ୟକ', passwordMin:'ପାସୱାର୍ଡ ଅତି କମରେ ୬ ଅକ୍ଷର',
    welcomeMsg:'🎉 ପୁଣି ସ୍ୱାଗତ!', createdMsg:'🎉 ଆକାଉଣ୍ଟ ସୃଷ୍ଟି ହେଲା!',
    genericError:'କିଛି ଭୁଲ ହେଲା। ପୁନଃଚେଷ୍ଟା କରନ୍ତୁ।',
    selectLanguage:'ଭାଷା ବାଛନ୍ତୁ', home:'ହୋମ', chat:'ଚାଟ', pictograms:'ଚିତ୍ରଲିପି',
    phrases:'ବାକ୍ୟାଂଶ', signAI:'ସଙ୍କେତ ଭାଷା', screenReader:'ସ୍କ୍ରିନ ରିଡର',
    community:'ସମୁଦାୟ', symptoms:'ଲକ୍ଷଣ', emergency:'ଜରୁରୀ',
    dashboard:'ଡ୍ୟାସବୋର୍ଡ', login:'ଲଗଇନ', logout:'ଲଗଆଉଟ', settings:'ସେଟିଂସ',
    send:'ପଠାନ୍ତୁ', speak:'କୁହନ୍ତୁ', translate:'ଅନୁବାଦ', clear:'ସଫା କରନ୍ତୁ',
    yourActivity:'ଆପଣଙ୍କ କାର୍ଯ୍ୟକଳାପ', chatSessions:'ଚାଟ ସେସନ', pictogramSessions:'ଚିତ୍ର ସେସନ',
    signSessions:'ସଙ୍କେତ ସେସନ', sosAlerts:'SOS ସତର୍କତା', symptomReports:'ଲକ୍ଷଣ ରିପୋର୍ଟ',
    totalActivities:'ମୋଟ କାର୍ଯ୍ୟକଳାପ', achievements:'ସଫଳତା', quickAccess:'ଦ୍ରୁତ ଆକ୍ସେସ',
    largeText:'ବଡ଼ ଟେକ୍ସଟ', theme:'ଥିମ', switchBtn:'ବଦଳାନ୍ତୁ',
  },
  mr: {
    welcomeBack:'पुन्हा स्वागत आहे', joinUs:'UnifyTalk मध्ये सामील व्हा',
    signInSub:'तुमच्या अ‍ॅक्सेसिबिलिटी प्लॅटफॉर्मवर साइन इन करा.',
    registerSub:'तुमचे खाते तयार करा आणि अडथळ्यांशिवाय संवाद सुरू करा.',
    signIn:'साइन इन', createAccount:'खाते तयार करा',
    fullName:'पूर्ण नाव', email:'ईमेल', password:'पासवर्ड',
    namePlaceholder:'तुमचे पूर्ण नाव', emailPlaceholder:'you@example.com',
    passwordPlaceholder:'पासवर्ड टाका', passwordRegPlaceholder:'किमान 6 अक्षरे',
    accessibilityNeed:'अ‍ॅक्सेसिबिलिटी गरज',
    none:'काहीही नाही', deaf:'बहिरा', mute:'मुका', blind:'अंध', lowVision:'कमी दृष्टी',
    signInBtn:'🔐 साइन इन', createBtn:'🚀 खाते तयार करा', wait:'⏳ कृपया थांबा…',
    noAccount:'खाते नाही?', signUpFree:'मोफत साइन अप',
    haveAccount:'आधीच खाते आहे?', signInLink:'साइन इन करा',
    nameRequired:'नाव आवश्यक', passwordMin:'पासवर्ड किमान 6 अक्षरे',
    welcomeMsg:'🎉 पुन्हा स्वागत!', createdMsg:'🎉 खाते तयार झाले!',
    genericError:'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.',
    selectLanguage:'भाषा निवडा', home:'होम', chat:'चॅट', pictograms:'चित्रलिपी',
    phrases:'वाक्ये', signAI:'सांकेतिक भाषा', screenReader:'स्क्रीन रीडर',
    community:'समुदाय', symptoms:'लक्षणे', emergency:'आणीबाणी',
    dashboard:'डॅशबोर्ड', login:'लॉगिन', logout:'लॉगआउट', settings:'सेटिंग्ज',
    send:'पाठवा', speak:'बोला', translate:'भाषांतर', clear:'साफ करा',
    yourActivity:'तुमची क्रिया', chatSessions:'चॅट सत्रे', pictogramSessions:'चित्र सत्रे',
    signSessions:'संकेत सत्रे', sosAlerts:'SOS सूचना', symptomReports:'लक्षण अहवाल',
    totalActivities:'एकूण क्रिया', achievements:'यश', quickAccess:'जलद प्रवेश',
    largeText:'मोठा मजकूर', theme:'थीम', switchBtn:'बदला',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Reset to 'en' once if user was previously stuck on 'ta' without a switcher
    const hasReset = localStorage.getItem('unifytalk-lang-reset-en');
    if (!hasReset) {
      localStorage.setItem('unifytalk-lang-reset-en', 'true');
      localStorage.setItem('unifytalk-lang', 'en');
      return 'en';
    }
    return localStorage.getItem('unifytalk-lang') || 'en';
  });

  const changeLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem('unifytalk-lang', code);
    document.documentElement.lang = code;
  }, []);

  const t = useCallback((key) => {
    return STRINGS[lang]?.[key] || STRINGS.en[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
