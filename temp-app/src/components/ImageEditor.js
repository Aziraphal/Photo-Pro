import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Box, Button, ButtonGroup, Slider, Typography, Paper, Grid, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Card, CardContent, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { 
  RotateRight, Save, Brightness6, Contrast, Undo, Restore, Crop,
  Lightbulb, Close, Help, AutoAwesome, AspectRatio,
  FilterVintage, FilterFrames, ExpandMore
} from '@mui/icons-material';
import FlipHorizontal from './icons/FlipHorizontal';
import FlipVertical from './icons/FlipVertical';
import Blur from './icons/Blur';

// Icône personnalisée pour la saturation
const SaturationIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16c-3.9 0-7-3.1-7-7 0-1.4 0.4-2.7 1.1-3.8 0.7 1.7 2.4 2.8 4.3 2.8 2.6 0 4.8-2.1 4.8-4.8 0-.3 0-.6-.1-.9 1.2 1.1 2 2.7 2 4.5 0 3.3-2.7 6-6 6z" />
  </svg>
);

// Icône personnalisée pour le noir et blanc
const BlackAndWhiteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 3h6.93c-.06.35-.14.68-.24 1H13v-1zm0 3h6.24c-.2.35-.43.69-.68 1H13v-1zm0 3h2.87c-.87.48-1.84.8-2.87.93V19z" />
  </svg>
);

// Icône personnalisée pour la netteté
const SharpnessIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8-9c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h4.94L12 2l3.06 3H20zm-7-1.53L9.21 7H5v10h14V7h-4.21L13 3.47z" />
  </svg>
);

// Base de connaissances pour l'assistant IA
const photoEditingTips = {
  general: [
    {
      id: 'welcome',
      message: "Bienvenue dans l'éditeur photo ! Pour commencer, téléchargez une image puis utilisez les outils ci-dessous pour l'améliorer.",
      condition: () => true, // Toujours affiché au démarrage
      priority: 10
    }
  ],
  brightness: [
    {
      id: 'brightness-too-high',
      message: "Attention, une luminosité trop élevée peut faire perdre des détails dans les zones claires de l'image.",
      condition: (state) => state.brightness > 0.6,
      priority: 8
    },
    {
      id: 'brightness-too-low',
      message: "Attention, une luminosité trop basse peut obscurcir les détails dans les zones sombres.",
      condition: (state) => state.brightness < -0.6,
      priority: 8
    },
    {
      id: 'brightness-with-contrast',
      message: "Conseil : Pour de meilleurs résultats, ajustez à la fois la luminosité et le contraste ensemble.",
      condition: (state) => Math.abs(state.brightness) > 0.3 && state.contrast === 0,
      priority: 6
    }
  ],
  contrast: [
    {
      id: 'contrast-too-high',
      message: "Un contraste trop élevé peut créer un aspect artificiel et faire perdre des détails dans les zones très claires et très sombres.",
      condition: (state) => state.contrast > 0.7,
      priority: 8
    },
    {
      id: 'contrast-too-low',
      message: "Un contraste trop faible peut rendre l'image plate et sans profondeur.",
      condition: (state) => state.contrast < -0.5,
      priority: 7
    }
  ],
  saturation: [
    {
      id: 'saturation-too-high',
      message: "Une saturation trop élevée peut rendre les couleurs peu naturelles et criardes.",
      condition: (state) => state.saturation > 0.7,
      priority: 8
    },
    {
      id: 'saturation-portrait',
      message: "Conseil pour les portraits : Une saturation légèrement réduite donne souvent un résultat plus naturel pour les tons de peau.",
      condition: (state) => state.saturation > 0,
      priority: 5
    }
  ],
  blackAndWhite: [
    {
      id: 'black-and-white-tip',
      message: "Le noir et blanc est idéal pour mettre en valeur les textures, les formes et le contraste plutôt que les couleurs.",
      condition: (state) => state.blackAndWhite,
      priority: 7
    },
    {
      id: 'black-and-white-contrast',
      message: "Pour les photos en noir et blanc, essayez d'augmenter légèrement le contraste pour un résultat plus dynamique.",
      condition: (state) => state.blackAndWhite && state.contrast < 0.2,
      priority: 6
    }
  ],
  crop: [
    {
      id: 'crop-rule-of-thirds',
      message: "Conseil de cadrage : Essayez de placer les éléments importants sur les intersections d'une grille 3x3 (règle des tiers).",
      condition: () => true, // Toujours affiché lors du recadrage
      priority: 7
    },
    {
      id: 'crop-subject',
      message: "Évitez de trop recadrer, ce qui pourrait réduire la qualité de l'image. Concentrez-vous sur le sujet principal.",
      condition: () => true,
      priority: 6
    }
  ],
  rotation: [
    {
      id: 'rotation-tip',
      message: "Assurez-vous que l'horizon ou les lignes principales sont bien horizontales pour une composition équilibrée.",
      condition: () => true,
      priority: 5
    }
  ],
  blur: [
    {
      id: 'blur-portrait',
      message: "Un léger flou peut adoucir les portraits et créer un effet plus flatteur pour la peau.",
      condition: (state) => state.blur > 0 && state.blur < 2,
      priority: 6
    },
    {
      id: 'blur-too-much',
      message: "Attention, un flou trop prononcé peut rendre l'image difficile à interpréter et masquer les détails importants.",
      condition: (state) => state.blur > 3,
      priority: 8
    },
    {
      id: 'blur-artistic',
      message: "Le flou peut créer un effet artistique, surtout sur les arrière-plans pour mettre en valeur le sujet principal.",
      condition: (state) => state.blur > 0,
      priority: 5
    }
  ],
  sharpness: [
    {
      id: 'sharpness-details',
      message: "La netteté est idéale pour accentuer les détails fins comme les textures, les paysages ou l'architecture.",
      condition: (state) => state.sharpness > 0,
      priority: 6
    },
    {
      id: 'sharpness-too-high',
      message: "Attention, une netteté excessive peut créer des halos indésirables autour des bords contrastés et un aspect artificiel.",
      condition: (state) => state.sharpness > 3,
      priority: 7
    },
    {
      id: 'sharpness-portrait',
      message: "Pour les portraits, utilisez la netteté avec modération pour éviter d'accentuer les imperfections de la peau.",
      condition: (state) => state.sharpness > 1,
      priority: 5
    }
  ],
  'auto-adjust': [
    {
      id: 'auto-adjust-explanation',
      message: "L'ajustement automatique analyse l'histogramme de votre image pour optimiser la luminosité, le contraste et la saturation en un seul clic.",
      condition: () => true,
      priority: 9
    },
    {
      id: 'auto-adjust-refine',
      message: "Conseil: Après l'ajustement automatique, vous pouvez affiner manuellement les paramètres selon vos préférences.",
      condition: () => true,
      priority: 7
    },
    {
      id: 'auto-adjust-not-perfect',
      message: "L'ajustement automatique fonctionne bien pour la plupart des images, mais certaines scènes spéciales (couchers de soleil, nuits étoilées, etc.) peuvent nécessiter des ajustements manuels.",
      condition: () => true,
      priority: 6
    }
  ],
  resize: [
    {
      id: 'resize-quality',
      message: "Attention: réduire significativement la taille d'une image est sans risque, mais l'agrandir au-delà de ses dimensions d'origine peut diminuer la qualité.",
      condition: () => true,
      priority: 8
    },
    {
      id: 'resize-aspect-ratio',
      message: "Conseil: conservez les proportions d'origine pour éviter de déformer l'image, sauf si vous souhaitez créer un effet spécifique.",
      condition: () => true,
      priority: 7
    },
    {
      id: 'resize-for-web',
      message: "Pour le web ou les réseaux sociaux, une largeur de 1200-2000px est généralement suffisante et optimise les temps de chargement.",
      condition: () => true,
      priority: 6
    }
  ],
  filter: [
    {
      id: 'filter-style',
      message: "Les filtres artistiques permettent de donner une ambiance particulière à votre image en un seul clic. Essayez différents styles pour trouver celui qui correspond le mieux à votre image.",
      condition: () => true,
      priority: 8
    },
    {
      id: 'filter-portrait',
      message: "Pour les portraits, essayez les filtres 'Warm' ou 'Vintage' qui peuvent donner un aspect flatteur et un ton chaleureux aux visages.",
      condition: () => true,
      priority: 7
    },
    {
      id: 'filter-landscape',
      message: "Pour les paysages, le filtre 'Vivid' peut faire ressortir les couleurs de la nature, tandis que 'Dramatic' ou 'Noir' peuvent créer une ambiance plus artistique.",
      condition: () => true,
      priority: 6
    },
    {
      id: 'filter-custom',
      message: "Après avoir appliqué un filtre, vous pouvez toujours ajuster manuellement les paramètres pour peaufiner le résultat selon vos préférences.",
      condition: () => true,
      priority: 5
    }
  ],
  warmth: [
    {
      id: 'warmth-tip',
      message: "L'ajustement de la température des couleurs permet de rendre une image plus chaude (tons orangés/rougeâtres) ou plus froide (tons bleuâtres).",
      condition: () => true,
      priority: 7
    },
    {
      id: 'warmth-portrait',
      message: "Une température plus chaude peut être flatteuse pour les portraits, tandis qu'une température froide peut évoquer une ambiance plus calme ou hivernale.",
      condition: () => true,
      priority: 6
    }
  ],
  sepia: [
    {
      id: 'sepia-tip',
      message: "L'effet sépia donne un ton brun-jaunâtre à votre image, évoquant les photographies anciennes et créant une atmosphère nostalgique.",
      condition: () => true,
      priority: 6
    }
  ],
  vignette: [
    {
      id: 'vignette-tip',
      message: "L'effet de vignette assombrit les bords de l'image, dirigeant l'attention vers le centre et créant une ambiance plus intime ou dramatique.",
      condition: () => true,
      priority: 6
    }
  ]
};

// Remplacer la fonction de simulation par une vraie intégration avec Google Cloud Vision API
const analyzeImageWithGoogleVision = async (imageDataUrl, editState) => {
  try {
    // Vérifier si la limite d'utilisation de l'API est atteinte
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const apiUsageKey = `vision_api_usage_${today}`;
    const apiUsage = parseInt(localStorage.getItem(apiUsageKey) || '0');
    
    // Limite fixée à 950 utilisations par jour
    const API_DAILY_LIMIT = 950;
    
    if (apiUsage >= API_DAILY_LIMIT) {
      console.warn("Limite quotidienne d'utilisation de l'API Vision atteinte");
      return [{
        id: 'api-limit',
        message: "La limite quotidienne d'analyse d'image a été atteinte. Les conseils IA ne sont pas disponibles pour le moment.",
        priority: 10
      }];
    }
    
    // Extraction de la partie base64 de l'URL data
    const base64Image = imageDataUrl.split(',')[1];

    // API Google Cloud Vision
    const API_KEY = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
    const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
    
    // Préparation de la requête
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10
            },
            {
              type: 'FACE_DETECTION',
              maxResults: 5
            },
            {
              type: 'IMAGE_PROPERTIES',
              maxResults: 5
            }
          ]
        }
      ]
    };
    
    // Envoi de la requête à l'API
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Incrémenter et sauvegarder le compteur d'utilisation
    localStorage.setItem(apiUsageKey, (apiUsage + 1).toString());
    
    // Traitement de la réponse
    const data = await response.json();
    console.log("Réponse de Google Vision API:", data);
    
    // Générer des conseils en fonction des données reçues
    const aiSuggestions = [];
    
    // Vérifier si des visages ont été détectés
    if (data.responses[0].faceAnnotations && data.responses[0].faceAnnotations.length > 0) {
      const faces = data.responses[0].faceAnnotations;
      
      // Conseil pour portrait avec visage
      aiSuggestions.push({
        id: 'ai-face-detected',
        message: "L'IA a détecté un portrait. Pour les portraits, il est conseillé d'avoir un contraste modéré et une saturation légèrement réduite pour des tons de peau naturels.",
        priority: 9
      });
      
      // Vérifier la joie (pour les portraits joyeux)
      const joyProbability = faces[0].joyLikelihood;
      if (['VERY_LIKELY', 'LIKELY'].includes(joyProbability)) {
        aiSuggestions.push({
          id: 'ai-joyful-portrait',
          message: "L'IA a détecté une expression joyeuse. Pour accentuer la vivacité, essayez d'augmenter légèrement la luminosité.",
          priority: 8
        });
      }
    }
    
    // Analyser les labels détectés
    if (data.responses[0].labelAnnotations) {
      const labels = data.responses[0].labelAnnotations.map(label => label.description.toLowerCase());
      
      // Conseils pour les paysages
      if (labels.some(label => ['nature', 'landscape', 'sky', 'mountain', 'beach', 'ocean', 'sea', 'lake'].includes(label))) {
        aiSuggestions.push({
          id: 'ai-landscape',
          message: "L'IA a détecté un paysage. Pour les paysages, essayez d'augmenter légèrement la saturation pour faire ressortir les couleurs naturelles.",
          priority: 8
        });
      }
      
      // Conseils pour les photos de nuit
      if (labels.some(label => ['night', 'dark', 'evening', 'low light'].includes(label))) {
        aiSuggestions.push({
          id: 'ai-night-photo',
          message: "L'IA a détecté une scène nocturne ou à faible luminosité. Essayez d'augmenter la luminosité et le contraste pour révéler plus de détails tout en conservant l'ambiance nocturne.",
          priority: 9
        });
      }
      
      // Conseils pour l'architecture
      if (labels.some(label => ['architecture', 'building', 'city', 'urban', 'structure'].includes(label))) {
        aiSuggestions.push({
          id: 'ai-architecture',
          message: "L'IA a détecté des éléments architecturaux. Le noir et blanc avec un contraste élevé pourrait mettre en valeur les lignes et les formes architecturales.",
          priority: 7
        });
      }
    }
    
    // Analyse des propriétés de l'image (couleurs)
    if (data.responses[0].imagePropertiesAnnotation) {
      const colors = data.responses[0].imagePropertiesAnnotation.dominantColors.colors;
      
      // Vérifier si l'image est déjà très colorée
      const vividColors = colors.some(color => {
        const rgb = color.color;
        // Calculer la saturation approximative
        const max = Math.max(rgb.red || 0, rgb.green || 0, rgb.blue || 0);
        const min = Math.min(rgb.red || 0, rgb.green || 0, rgb.blue || 0);
        const chroma = max - min;
        const saturation = max === 0 ? 0 : chroma / max;
        
        return saturation > 0.7 && color.score > 0.15; // Couleur saturée et significative
      });
      
      if (vividColors && editState.saturation > 0.2) {
        aiSuggestions.push({
          id: 'ai-vivid-colors',
          message: "L'IA a détecté que l'image possède déjà des couleurs vives. Attention à ne pas trop augmenter la saturation pour éviter un aspect artificiel.",
          priority: 8
        });
      }
      
      // Vérifier si l'image est plutôt monochrome/fade
      const isMonochrome = colors.every(color => {
        const rgb = color.color;
        const max = Math.max(rgb.red || 0, rgb.green || 0, rgb.blue || 0);
        const min = Math.min(rgb.red || 0, rgb.green || 0, rgb.blue || 0);
        const chroma = max - min;
        const saturation = max === 0 ? 0 : chroma / max;
        
        return saturation < 0.3; // Couleurs peu saturées
      });
      
      if (isMonochrome && editState.saturation < 0.1 && !editState.blackAndWhite) {
        aiSuggestions.push({
          id: 'ai-monochrome',
          message: "L'IA a détecté des couleurs peu saturées. Essayez d'augmenter légèrement la saturation ou optez pour un noir et blanc contrasté pour un effet artistique.",
          priority: 7
        });
      }
    }
    
    // Si aucune suggestion spécifique n'a été générée, ajouter une suggestion générale
    if (aiSuggestions.length === 0) {
      aiSuggestions.push({
        id: 'ai-general',
        message: "Basé sur l'analyse de l'IA, votre image semble bien équilibrée. Expérimentez avec différents styles pour trouver celui qui vous plaît le plus.",
        priority: 6
      });
    }
    
    // Ajouter des conseils basés sur l'état d'édition actuel
    // Ces conseils sont combinés avec l'analyse de l'image
    if (editState.brightness > 0.5) {
      aiSuggestions.push({
        id: 'ai-brightness-high',
        message: "L'IA a détecté que la luminosité est élevée. Attention à la perte de détails dans les zones claires.",
        priority: 8
      });
    }
    
    if (editState.contrast > 0.7) {
      aiSuggestions.push({
        id: 'ai-contrast-high',
        message: "Le contraste élevé peut créer un impact visuel fort, mais l'IA suggère de préserver les détails en réduisant légèrement le contraste.",
        priority: 7
      });
    }
    
    // Trier les suggestions par priorité
    return aiSuggestions.sort((a, b) => b.priority - a.priority);
    
  } catch (error) {
    console.error("Erreur lors de l'analyse avec Google Vision API:", error);
    // En cas d'erreur, retourner un message générique
    return [{
      id: 'ai-error',
      message: "Nous rencontrons des difficultés avec l'analyse d'image. Continuez votre édition pendant que nous résolvons le problème.",
      priority: 5
    }];
  }
};

// Mettre à jour le composant AIAssistant pour utiliser l'API Google Vision
const AIAssistant = ({ currentState, lastAction, isVisible, onClose, canvasRef }) => {
  const [currentTip, setCurrentTip] = useState(null);
  const [isLoadingAITip, setIsLoadingAITip] = useState(false);
  const [aiTips, setAiTips] = useState([]);
  const [apiUsageCount, setApiUsageCount] = useState(0);
  const [apiDailyLimit] = useState(950);
  
  // Récupérer le compteur d'utilisation
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const apiUsageKey = `vision_api_usage_${today}`;
    const usage = parseInt(localStorage.getItem(apiUsageKey) || '0');
    setApiUsageCount(usage);
    
    // Mettre à jour le compteur toutes les minutes
    const interval = setInterval(() => {
      const currentUsage = parseInt(localStorage.getItem(apiUsageKey) || '0');
      setApiUsageCount(currentUsage);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Récupérer les conseils de l'IA
  useEffect(() => {
    if (!isVisible || !currentState || !lastAction || !canvasRef || !canvasRef.current) return;
    
    const getAITips = async () => {
      setIsLoadingAITip(true);
      try {
        // Capturer l'image actuelle du canvas
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7); // Qualité réduite pour optimiser
        
        // Analyser l'image avec Google Vision API
        const suggestions = await analyzeImageWithGoogleVision(imageDataUrl, currentState);
        setAiTips(suggestions);
      } catch (error) {
        console.error("Erreur lors de l'analyse IA:", error);
        setAiTips([{
          id: 'ai-error',
          message: "Une erreur est survenue lors de l'analyse de votre image. Veuillez réessayer plus tard.",
          priority: 10
        }]);
      } finally {
        setIsLoadingAITip(false);
      }
    };
    
    // Appeler l'IA seulement après certaines actions importantes
    // pour limiter les appels API (qui sont facturés)
    if (['blackAndWhite', 'crop', 'rotation'].includes(lastAction)) {
      getAITips();
    } else if (lastAction === 'manual-analyze') {
      // Permettre une analyse manuelle via un bouton
      getAITips();
    }
  }, [isVisible, currentState, lastAction, canvasRef]);
  
  // Déterminer le meilleur conseil à afficher
  useEffect(() => {
    if (!isVisible || !currentState) return;
    
    // Combiner les conseils statiques et ceux de l'IA
    let allTips = [...photoEditingTips.general];
    
    // Ajouter des conseils spécifiques en fonction de l'action récente
    if (lastAction === 'brightness') {
      allTips = [...allTips, ...photoEditingTips.brightness];
    } else if (lastAction === 'contrast') {
      allTips = [...allTips, ...photoEditingTips.contrast];
    } else if (lastAction === 'saturation') {
      allTips = [...allTips, ...photoEditingTips.saturation];
    } else if (lastAction === 'blackAndWhite') {
      allTips = [...allTips, ...photoEditingTips.blackAndWhite];
    } else if (lastAction === 'crop') {
      allTips = [...allTips, ...photoEditingTips.crop];
    } else if (lastAction === 'rotation') {
      allTips = [...allTips, ...photoEditingTips.rotation];
    } else if (lastAction === 'blur') {
      allTips = [...allTips, ...photoEditingTips.blur];
    } else if (lastAction === 'sharpness') {
      allTips = [...allTips, ...photoEditingTips.sharpness];
    } else if (lastAction === 'auto-adjust') {
      allTips = [...allTips, ...photoEditingTips['auto-adjust']];
    } else if (lastAction === 'resize') {
      allTips = [...allTips, ...photoEditingTips.resize];
    } else if (lastAction === 'filter') {
      allTips = [...allTips, ...photoEditingTips.filter];
    } else if (lastAction === 'warmth') {
      allTips = [...allTips, ...photoEditingTips.warmth];
    } else if (lastAction === 'sepia') {
      allTips = [...allTips, ...photoEditingTips.sepia];
    } else if (lastAction === 'vignette') {
      allTips = [...allTips, ...photoEditingTips.vignette];
    }
    
    // Ajouter les conseils de l'IA s'ils existent
    if (aiTips.length > 0) {
      allTips = [...aiTips, ...allTips]; // Donner la priorité aux conseils IA
    }
    
    // Filtrer les conseils selon leur condition
    const applicableTips = allTips.filter(tip => 
      tip.condition ? tip.condition(currentState) : true
    );
    
    // Trier par priorité
    const sortedTips = applicableTips.sort((a, b) => b.priority - a.priority);
    
    // Prendre le conseil le plus pertinent
    if (sortedTips.length > 0) {
      setCurrentTip(sortedTips[0]);
    } else {
      setCurrentTip(null);
    }
  }, [currentState, lastAction, isVisible, aiTips]);
  
  if (!isVisible) return null;
  
  return (
    <Card sx={{ position: 'relative', mt: 2, mb: 2, backgroundColor: '#f0f7ff', borderLeft: '4px solid #3f51b5' }}>
      <CardContent sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lightbulb color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" component="div" fontWeight="medium">
              {isLoadingAITip ? "Analyse Google Vision en cours..." : "Conseil IA pour votre photo"}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ mr: 2 }}>
            Analyses aujourd'hui: {apiUsageCount}/{apiDailyLimit}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        {isLoadingAITip ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Google Cloud Vision analyse votre image pour des conseils personnalisés...
            </Typography>
          </Box>
        ) : currentTip ? (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {currentTip.message}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Continuez vos modifications. L'IA vous conseillera lorsque c'est nécessaire.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Définition des filtres artistiques prédéfinis
const artisticFilters = [
  {
    id: 'normal',
    name: 'Normal',
    settings: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpness: 0,
      blackAndWhite: false,
      sepia: false,
      vignette: false
    }
  },
  {
    id: 'vintage',
    name: 'Vintage',
    settings: {
      brightness: 0.05,
      contrast: 0.1,
      saturation: -0.2,
      sepia: true,
      vignette: true
    }
  },
  {
    id: 'noir',
    name: 'Noir',
    settings: {
      brightness: 0,
      contrast: 0.3,
      blackAndWhite: true,
      vignette: true
    }
  },
  {
    id: 'vivid',
    name: 'Vif',
    settings: {
      brightness: 0.1,
      contrast: 0.2,
      saturation: 0.3,
      sharpness: 1.5
    }
  },
  {
    id: 'muted',
    name: 'Pastel',
    settings: {
      brightness: 0.1,
      contrast: -0.1,
      saturation: -0.3,
      blur: 0.5
    }
  },
  {
    id: 'dramatic',
    name: 'Dramatique',
    settings: {
      brightness: -0.1,
      contrast: 0.4,
      saturation: 0.1,
      vignette: true
    }
  },
  {
    id: 'warm',
    name: 'Chaud',
    settings: {
      brightness: 0.1,
      contrast: 0.05,
      saturation: 0.15,
      warmth: 30
    }
  },
  {
    id: 'cool',
    name: 'Froid',
    settings: {
      brightness: 0,
      contrast: 0.05,
      saturation: 0,
      warmth: -30
    }
  }
];

const ImageEditor = ({ imageUrl }) => {
  const canvasEl = useRef(null);
  const cropCanvasRef = useRef(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blackAndWhite, setBlackAndWhite] = useState(false);
  const [blur, setBlur] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [editedImage, setEditedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [originalImgRef, setOriginalImgRef] = useState(null);
  
  // États pour le recadrage
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropStartX, setCropStartX] = useState(0);
  const [cropStartY, setCropStartY] = useState(0);
  const [cropEndX, setCropEndX] = useState(0);
  const [cropEndY, setCropEndY] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // État pour l'assistant IA
  const [lastAction, setLastAction] = useState('general');
  const [assistantVisible, setAssistantVisible] = useState(true);
  
  // États pour le redimensionnement
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  
  // États pour les filtres artistiques
  const [activeFilterTab, setActiveFilterTab] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('normal');
  const [sepia, setSepia] = useState(false);
  const [vignette, setVignette] = useState(false);
  const [warmth, setWarmth] = useState(0);
  
  // État pour le contrôle des accordéons
  const [expandedPanel, setExpandedPanel] = useState('panel1');
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };
  
  // Fonction pour déclencher manuellement l'analyse IA
  const triggerAIAnalysis = () => {
    setLastAction('manual-analyze');
    setAssistantVisible(true);
  };
  
  // Charger l'image
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      // Canvas est déjà créé et disponible
      const canvas = canvasEl.current;
      if (!canvas) return;
      
      // Augmenter la taille du canvas pour une meilleure qualité
      const containerWidth = 800;
      const containerHeight = 600;
      
      // Redimensionner le canvas pour qu'il corresponde mieux à l'image
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      const ctx = canvas.getContext('2d');
      // Activer l'anticrénelage pour une meilleure qualité
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      let newWidth = img.width;
      let newHeight = img.height;
      
      // Redimensionner si l'image est plus grande que le conteneur
      if (img.width > containerWidth || img.height > containerHeight) {
        const ratioX = containerWidth / img.width;
        const ratioY = containerHeight / img.height;
        const ratio = Math.min(ratioX, ratioY);
        
        newWidth = img.width * ratio;
        newHeight = img.height * ratio;
      }
      
      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner l'image centrée
      const offsetX = (containerWidth - newWidth) / 2;
      const offsetY = (containerHeight - newHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
      
      // Sauvegarder l'image d'origine pour pouvoir y revenir
      setOriginalImgRef(img);
      
      // Sauvegarder l'image d'origine et l'état initial dans l'historique
      const initialState = {
        originalImage: img,
        width: newWidth,
        height: newHeight,
        offsetX,
        offsetY,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        rotation: 0,
        flipX: false,
        flipY: false,
        blackAndWhite: false
      };
      
      setEditedImage(initialState);
      setOriginalImage(initialState);
      // Réinitialiser l'historique avec l'état initial
      setHistory([initialState]);
      setHistoryIndex(0);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setBlackAndWhite(false);
      
      // Définir l'action initiale pour l'assistant
      setLastAction('general');
    };
    
    img.onerror = (err) => {
      console.error("Erreur lors du chargement de l'image:", err);
    };
    
    // Charger l'image directement sans conversion intermédiaire
    img.src = imageUrl;
    
  }, [imageUrl]);
  
  // Fonction pour ajouter un état à l'historique
  const addToHistory = useCallback((newState) => {
    // Supprimer les états après l'index actuel si on revient en arrière puis qu'on fait une modification
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Ajouter le nouvel état
    newHistory.push(newState);
    
    // Mettre à jour l'historique et l'index
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // Mettre à la fin pour résoudre les dépendances circulaires
  const applyTransformations = useCallback((state) => {
    if (!state || !state.originalImage) return;
    
    const canvas = canvasEl.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Activer l'anticrénelage pour une meilleure qualité
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculer le centre du canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Sauvegarder le contexte actuel
    ctx.save();
    
    // Appliquer les filtres de luminosité, contraste, saturation et flou
    ctx.filter = `brightness(${100 + state.brightness * 100}%) contrast(${100 + state.contrast * 100}%) saturate(${100 + state.saturation * 100}%) blur(${state.blur || 0}px)`;
    
    // Translater au centre du canvas pour les transformations
    ctx.translate(centerX, centerY);
    
    // Appliquer la rotation si nécessaire
    ctx.rotate((state.rotation || 0) * Math.PI / 180);
    
    // Appliquer les retournements si nécessaires
    ctx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);
    
    // Dessiner l'image transformée (centrée autour de l'origine après la translation)
    const drawWidth = state.width;
    const drawHeight = state.height;
    
    ctx.drawImage(
      state.originalImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    
    // Restaurer le contexte avant d'appliquer d'autres effets
    ctx.restore();
    
    // Appliquer le filtre noir et blanc si activé
    if (state.blackAndWhite) {
      // Récupérer les données de l'image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convertir en noir et blanc
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // Rouge
        data[i + 1] = avg; // Vert
        data[i + 2] = avg; // Bleu
      }
      
      // Remettre les données dans le canvas
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Appliquer l'effet sépia si activé
    if (state.sepia) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Formule sépia standard
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Appliquer l'effet de température (chaud/froid) si différent de 0
    if (state.warmth && state.warmth !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const warmthValue = state.warmth;
      
      for (let i = 0; i < data.length; i += 4) {
        // Ajuster le rouge et le bleu pour chaud/froid
        if (warmthValue > 0) {
          // Plus chaud: augmenter le rouge, diminuer le bleu
          data[i] = Math.min(255, data[i] + warmthValue);
          data[i + 2] = Math.max(0, data[i + 2] - warmthValue / 2);
        } else {
          // Plus froid: augmenter le bleu, diminuer le rouge
          data[i] = Math.max(0, data[i] + warmthValue / 2);
          data[i + 2] = Math.min(255, data[i + 2] - warmthValue);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Appliquer l'effet vignette si activé
    if (state.vignette) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.9;
      
      // Créer un dégradé radial
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
      
      // Appliquer le dégradé
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    // Appliquer la netteté si nécessaire (convolution)
    if (state.sharpness > 0) {
      const sharpValue = state.sharpness * 0.5; // Réduire l'intensité
      
      // Récupérer les données de l'image
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Appliquer un filtre de netteté par convolution
      const sharpenedData = applySharpen(imageData, sharpValue);
      
      // Remettre les données dans le canvas
      ctx.putImageData(sharpenedData, 0, 0);
    }
  }, [applySharpen]);
  
  // Mettre à jour le canvas quand editedImage change
  useEffect(() => {
    if (!editedImage) return;
    applyTransformations(editedImage);
  }, [editedImage, applyTransformations]);
  
  // Mettre à jour les filtres
  const updateFilter = useCallback((type, value) => {
    if (!editedImage) return;
    
    const newState = {
      ...editedImage,
      [type]: value
    };
    
    setEditedImage(newState);
  }, [editedImage]);
  
  // Cette fonction est appelée quand on relâche le slider
  const commitFilterChange = useCallback((filterType) => {
    if (!editedImage) return;
    
    // Mettre à jour l'état dans l'historique
    addToHistory({
      ...editedImage,
      brightness,
      contrast,
      saturation,
      blur,
      sharpness,
      blackAndWhite
    });
    
    // Mettre à jour l'action pour l'assistant
    setLastAction(filterType);
    setAssistantVisible(true);
  }, [editedImage, brightness, contrast, saturation, blur, sharpness, blackAndWhite, addToHistory]);
  
  // Toggle pour le noir et blanc
  const toggleBlackAndWhite = useCallback((event) => {
    const isChecked = event.target.checked;
    setBlackAndWhite(isChecked);
    
    const newState = {
      ...editedImage,
      blackAndWhite: isChecked
    };
    
    setEditedImage(newState);
    addToHistory(newState);
    
    // Mettre à jour l'action pour l'assistant
    setLastAction('blackAndWhite');
    setAssistantVisible(true);
  }, [editedImage, addToHistory]);
  
  // Fonction de dessin pour le recadrage (déplacée en premier pour résoudre les dépendances)
  const drawCropSelection = useCallback((ctx, startX, startY, endX, endY) => {
    const canvas = cropCanvasRef.current;
    if (!canvas || !canvasEl.current) return;
    
    // Redessiner l'image pour effacer l'ancienne sélection
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasEl.current, 0, 0);
    
    // Calculer les dimensions de la sélection
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    
    // Créer un effet d'assombrissement sur toute l'image sauf la zone sélectionnée
    // D'abord, nous créons un rectangle semi-transparent sur toute l'image
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ensuite, on "découpe" la zone sélectionnée pour la rendre transparente
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(left, top, width, height);
    
    // On revient au mode normal de dessin
    ctx.globalCompositeOperation = 'source-over';
    
    // Dessiner un cadre autour de la sélection
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, width, height);
    
    // Ajouter des poignées aux coins pour un aspect plus interactif
    const handleSize = 8;
    ctx.fillStyle = '#fff';
    
    // Poignées aux quatre coins
    ctx.fillRect(left - handleSize/2, top - handleSize/2, handleSize, handleSize);
    ctx.fillRect(left + width - handleSize/2, top - handleSize/2, handleSize, handleSize);
    ctx.fillRect(left - handleSize/2, top + height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(left + width - handleSize/2, top + height - handleSize/2, handleSize, handleSize);
  }, []);
  
  // Maintenant que drawCropSelection est défini, on peut définir les autres fonctions qui en dépendent
  const handleCropMouseMove = useCallback((e) => {
    if (!isDrawing || !cropCanvasRef.current) return;
    
    const rect = cropCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropEndX(x);
    setCropEndY(y);
    
    const ctx = cropCanvasRef.current.getContext('2d');
    drawCropSelection(ctx, cropStartX, cropStartY, x, y);
  }, [isDrawing, cropStartX, cropStartY, drawCropSelection]);
  
  // Fonctions de recadrage
  const openCropDialog = useCallback(() => {
    if (!editedImage) return;
    
    setCropDialogOpen(true);
    
    // Mettre à jour l'action pour l'assistant
    setLastAction('crop');
    setAssistantVisible(true);
    
    // Initialiser le canvas de recadrage une fois que la boîte de dialogue est ouverte
    setTimeout(() => {
      const cropCanvas = cropCanvasRef.current;
      if (!cropCanvas || !canvasEl.current) return;
      
      // Redimensionner le canvas de recadrage à la taille de l'image actuelle
      cropCanvas.width = canvasEl.current.width;
      cropCanvas.height = canvasEl.current.height;
      
      // Obtenir le contexte et dessiner l'image actuelle
      const ctx = cropCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvasEl.current, 0, 0);
      
      // Initialiser la zone de sélection au centre
      const centerX = cropCanvas.width / 2;
      const centerY = cropCanvas.height / 2;
      const size = Math.min(centerX, centerY) / 2;
      
      setCropStartX(centerX - size);
      setCropStartY(centerY - size);
      setCropEndX(centerX + size);
      setCropEndY(centerY + size);
      
      // Dessiner la zone de sélection
      drawCropSelection(ctx, centerX - size, centerY - size, centerX + size, centerY + size);
    }, 100);
  }, [editedImage, drawCropSelection]);
  
  const handleCropMouseDown = useCallback((e) => {
    if (!cropCanvasRef.current) return;
    
    const rect = cropCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStartX(x);
    setCropStartY(y);
    setCropEndX(x);
    setCropEndY(y);
    setIsDrawing(true);
  }, []);
  
  const handleCropMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);
  
  const applyCrop = () => {
    if (!editedImage || !cropCanvasRef.current) return;
    
    // Calculer les coordonnées de la zone de recadrage
    const left = Math.min(cropStartX, cropEndX);
    const top = Math.min(cropStartY, cropEndY);
    const width = Math.abs(cropEndX - cropStartX);
    const height = Math.abs(cropEndY - cropStartY);
    
    // Créer un canvas temporaire pour le recadrage
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    tempCtx.drawImage(canvasEl.current, left, top, width, height, 0, 0, width, height);
    
    // Créer une nouvelle image à partir du canvas recadré avec qualité maximale
    const croppedImg = new Image();
    croppedImg.crossOrigin = "Anonymous";
    croppedImg.src = tempCanvas.toDataURL('image/png', 1.0);
    
    croppedImg.onload = () => {
      // Calculer les nouvelles dimensions et position
      const canvas = canvasEl.current;
      const containerWidth = canvas.width;
      const containerHeight = canvas.height;
      
      let newWidth = width;
      let newHeight = height;
      
      // Redimensionner si l'image est plus grande que le conteneur
      if (width > containerWidth || height > containerHeight) {
        const ratioX = containerWidth / width;
        const ratioY = containerHeight / height;
        const ratio = Math.min(ratioX, ratioY);
        
        newWidth = width * ratio;
        newHeight = height * ratio;
      }
      
      // Calculer les nouveaux offsets pour centrer l'image
      const offsetX = (containerWidth - newWidth) / 2;
      const offsetY = (containerHeight - newHeight) / 2;
      
      // Créer un nouvel état avec l'image recadrée
      const newState = {
        ...editedImage,
        originalImage: croppedImg,
        width: newWidth,
        height: newHeight,
        offsetX,
        offsetY
      };
      
      setEditedImage(newState);
      addToHistory(newState);
      
      // Fermer la boîte de dialogue
      setCropDialogOpen(false);
    };
  };
  
  // Fonctions d'édition d'image
  const rotateImage = () => {
    if (!editedImage) return;
    
    // Calculer la nouvelle rotation
    const newRotation = (editedImage.rotation || 0) + 90;
    
    // Créer un nouvel état avec la rotation mise à jour
    const newState = {
      ...editedImage,
      rotation: newRotation % 360,
      // Si la rotation est 90° ou 270°, on échange la largeur et la hauteur
      width: (newRotation % 180 === 90) ? editedImage.height : editedImage.width,
      height: (newRotation % 180 === 90) ? editedImage.width : editedImage.height
    };
    
    setEditedImage(newState);
    addToHistory(newState);
    
    // Mettre à jour l'action pour l'assistant
    setLastAction('rotation');
    setAssistantVisible(true);
  };
  
  const flipHorizontal = () => {
    if (!editedImage) return;
    
    const newState = {
      ...editedImage,
      flipX: !editedImage.flipX
    };
    
    setEditedImage(newState);
    addToHistory(newState);
  };
  
  const flipVertical = () => {
    if (!editedImage) return;
    
    const newState = {
      ...editedImage,
      flipY: !editedImage.flipY
    };
    
    setEditedImage(newState);
    addToHistory(newState);
  };
  
  const undo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const previousState = history[newIndex];
    
    setHistoryIndex(newIndex);
    setEditedImage(previousState);
    setBrightness(previousState.brightness);
    setContrast(previousState.contrast);
    setSaturation(previousState.saturation);
    setBlackAndWhite(previousState.blackAndWhite);
  };
  
  const reset = () => {
    if (!originalImage) return;
    
    setEditedImage(originalImage);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlackAndWhite(false);
    
    // Réinitialiser l'historique
    setHistory([originalImage]);
    setHistoryIndex(0);
  };
  
  const saveImage = () => {
    if (!canvasEl.current) return;
    
    try {
      // Enregistrer avec la qualité maximale
      const dataUrl = canvasEl.current.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'edited-image.png';
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'image:", error);
    }
  };
  
  // Fonction d'ajustement automatique
  const autoAdjust = () => {
    if (!editedImage || !canvasEl.current) return;
    
    try {
      // Obtenir les données de l'image actuelle depuis le canvas
      const canvas = canvasEl.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyser l'histogramme de l'image
      const histogramR = new Array(256).fill(0);
      const histogramG = new Array(256).fill(0);
      const histogramB = new Array(256).fill(0);
      
      // Calculer l'histogramme pour chaque canal
      for (let i = 0; i < data.length; i += 4) {
        histogramR[data[i]]++;         // Rouge
        histogramG[data[i + 1]]++;     // Vert
        histogramB[data[i + 2]]++;     // Bleu
      }
      
      // Calculer les valeurs minimales et maximales significatives (ignorer les valeurs extrêmes)
      const totalPixels = canvas.width * canvas.height;
      const threshold = totalPixels * 0.005; // Ignorer 0.5% des pixels pour éviter les outliers
      
      // Fonction pour trouver la valeur minimale significative
      const findMin = (histogram) => {
        let count = 0;
        for (let i = 0; i < 256; i++) {
          count += histogram[i];
          if (count > threshold) return i;
        }
        return 0;
      };
      
      // Fonction pour trouver la valeur maximale significative
      const findMax = (histogram) => {
        let count = 0;
        for (let i = 255; i >= 0; i--) {
          count += histogram[i];
          if (count > threshold) return i;
        }
        return 255;
      };
      
      // Calculer les valeurs min et max pour chaque canal
      const minR = findMin(histogramR);
      const maxR = findMax(histogramR);
      const minG = findMin(histogramG);
      const maxG = findMax(histogramG);
      const minB = findMin(histogramB);
      const maxB = findMax(histogramB);
      
      // Calculer la moyenne des valeurs min et max
      const minAvg = (minR + minG + minB) / 3;
      const maxAvg = (maxR + maxG + maxB) / 3;
      
      // Normaliser pour obtenir des valeurs entre -1 et 1
      let newBrightness = 0;
      let newContrast = 0;
      let newSaturation = 0;
      
      // Ajuster la luminosité en fonction de la moyenne de l'image
      const luminance = (minAvg + maxAvg) / 2;
      if (luminance < 100) {
        // Image trop sombre
        newBrightness = Math.min((128 - luminance) / 128, 0.7);
      } else if (luminance > 156) {
        // Image trop claire
        newBrightness = Math.max((128 - luminance) / 128, -0.7);
      }
      
      // Ajuster le contraste en fonction de la plage dynamique
      const range = maxAvg - minAvg;
      if (range < 100) {
        // Faible contraste
        newContrast = Math.min((100 - range) / 100, 0.7);
      }
      
      // Calculer la saturation actuelle (approximation)
      let totalSaturation = 0;
      let pixelCount = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        if (max > 0) {
          const saturation = delta / max;
          totalSaturation += saturation;
          pixelCount++;
        }
      }
      
      const avgSaturation = pixelCount > 0 ? totalSaturation / pixelCount : 0;
      
      // Ajuster la saturation si nécessaire
      if (avgSaturation < 0.2) {
        // Image peu saturée
        newSaturation = Math.min((0.3 - avgSaturation) * 2, 0.4);
      } else if (avgSaturation > 0.6) {
        // Image très saturée
        newSaturation = Math.max((0.4 - avgSaturation) * 1.5, -0.3);
      }
      
      // Mettre à jour les états et l'image
      setBrightness(newBrightness);
      setContrast(newContrast);
      setSaturation(newSaturation);
      
      // Créer un nouvel état avec les ajustements automatiques
      const newState = {
        ...editedImage,
        brightness: newBrightness,
        contrast: newContrast,
        saturation: newSaturation
      };
      
      setEditedImage(newState);
      addToHistory(newState);
      
      // Forcer une mise à jour du canvas avec les nouveaux paramètres
      setTimeout(() => {
        applyTransformations(newState);
      }, 0);
      
      // Mettre à jour l'action pour l'assistant
      setLastAction('auto-adjust');
      setAssistantVisible(true);
    } catch (error) {
      console.error("Erreur dans autoAdjust:", error);
    }
  };
  
  // Fonction pour ouvrir la boîte de dialogue de redimensionnement
  const openResizeDialog = () => {
    if (!editedImage) return;
    
    // Initialiser les dimensions avec les valeurs actuelles
    setNewWidth(Math.round(editedImage.width));
    setNewHeight(Math.round(editedImage.height));
    setAspectRatio(editedImage.width / editedImage.height);
    setResizeDialogOpen(true);
    
    // Mettre à jour l'action pour l'assistant
    setLastAction('resize');
    setAssistantVisible(true);
  };
  
  // Gérer le changement de largeur
  const handleWidthChange = (e) => {
    const width = parseInt(e.target.value) || 0;
    setNewWidth(width);
    
    if (maintainAspectRatio && width > 0) {
      setNewHeight(Math.round(width / aspectRatio));
    }
  };
  
  // Gérer le changement de hauteur
  const handleHeightChange = (e) => {
    const height = parseInt(e.target.value) || 0;
    setNewHeight(height);
    
    if (maintainAspectRatio && height > 0) {
      setNewWidth(Math.round(height * aspectRatio));
    }
  };
  
  // Appliquer le redimensionnement
  const applyResize = () => {
    if (!editedImage || !canvasEl.current || newWidth <= 0 || newHeight <= 0) return;
    
    // Créer un canvas temporaire pour le redimensionnement
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    // Dessiner l'image originale redimensionnée
    tempCtx.drawImage(
      editedImage.originalImage,
      0, 0, editedImage.originalImage.width, editedImage.originalImage.height,
      0, 0, newWidth, newHeight
    );
    
    // Créer une nouvelle image à partir du canvas redimensionné
    const resizedImg = new Image();
    resizedImg.crossOrigin = "Anonymous";
    resizedImg.src = tempCanvas.toDataURL('image/png', 1.0);
    
    resizedImg.onload = () => {
      // Calculer les nouvelles dimensions et position
      const canvas = canvasEl.current;
      const containerWidth = canvas.width;
      const containerHeight = canvas.height;
      
      let finalWidth = newWidth;
      let finalHeight = newHeight;
      
      // Redimensionner si l'image est plus grande que le conteneur
      if (newWidth > containerWidth || newHeight > containerHeight) {
        const ratioX = containerWidth / newWidth;
        const ratioY = containerHeight / newHeight;
        const ratio = Math.min(ratioX, ratioY);
        
        finalWidth = newWidth * ratio;
        finalHeight = newHeight * ratio;
      }
      
      // Calculer les nouveaux offsets pour centrer l'image
      const offsetX = (containerWidth - finalWidth) / 2;
      const offsetY = (containerHeight - finalHeight) / 2;
      
      // Créer un nouvel état avec l'image redimensionnée
      const newState = {
        ...editedImage,
        originalImage: resizedImg,
        width: finalWidth,
        height: finalHeight,
        offsetX,
        offsetY
      };
      
      setEditedImage(newState);
      addToHistory(newState);
      
      // Fermer la boîte de dialogue
      setResizeDialogOpen(false);
    };
  };
  
  // Appliquer un filtre artistique prédéfini
  const applyArtisticFilter = (filterId) => {
    if (!editedImage) return;
    
    setCurrentFilter(filterId);
    
    // Trouver le filtre sélectionné
    const filter = artisticFilters.find(f => f.id === filterId);
    if (!filter) return;
    
    // Appliquer les paramètres du filtre
    const settings = filter.settings;
    
    // Mettre à jour les états avec les nouvelles valeurs
    setBrightness(settings.brightness !== undefined ? settings.brightness : brightness);
    setContrast(settings.contrast !== undefined ? settings.contrast : contrast);
    setSaturation(settings.saturation !== undefined ? settings.saturation : saturation);
    setBlur(settings.blur !== undefined ? settings.blur : blur);
    setSharpness(settings.sharpness !== undefined ? settings.sharpness : sharpness);
    setBlackAndWhite(settings.blackAndWhite !== undefined ? settings.blackAndWhite : blackAndWhite);
    setSepia(settings.sepia !== undefined ? settings.sepia : sepia);
    setVignette(settings.vignette !== undefined ? settings.vignette : vignette);
    setWarmth(settings.warmth !== undefined ? settings.warmth : warmth);
    
    // Créer un nouvel état avec les paramètres du filtre
    const newState = {
      ...editedImage,
      brightness: settings.brightness !== undefined ? settings.brightness : brightness,
      contrast: settings.contrast !== undefined ? settings.contrast : contrast,
      saturation: settings.saturation !== undefined ? settings.saturation : saturation,
      blur: settings.blur !== undefined ? settings.blur : blur,
      sharpness: settings.sharpness !== undefined ? settings.sharpness : sharpness,
      blackAndWhite: settings.blackAndWhite !== undefined ? settings.blackAndWhite : blackAndWhite,
      sepia: settings.sepia !== undefined ? settings.sepia : sepia,
      vignette: settings.vignette !== undefined ? settings.vignette : vignette,
      warmth: settings.warmth !== undefined ? settings.warmth : warmth
    };
    
    setEditedImage(newState);
    addToHistory(newState);
    
    // Mettre à jour l'action pour l'assistant
    setLastAction('filter');
    setAssistantVisible(true);
  };
  
  // Gérer le changement d'onglet
  const handleFilterTabChange = (event, newValue) => {
    setActiveFilterTab(newValue);
  };
  
  // Nettoyage des écouteurs d'événements dans le useEffect pour éviter les fuites mémoire
  useEffect(() => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = handleCropMouseDown;
    const handleMouseMove = handleCropMouseMove;
    const handleMouseUp = handleCropMouseUp;

    if (cropDialogOpen) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [cropDialogOpen, handleCropMouseDown, handleCropMouseMove, handleCropMouseUp]);
  
  // Fonction pour appliquer un effet de netteté par convolution
  const applySharpen = useCallback((imageData, intensity) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const sharpenedData = new Uint8ClampedArray(data);
    
    // Matrice de convolution pour la netteté (Unsharp Masking)
    // Centre plus élevé, voisins négatifs
    const kernel = [
      0, -intensity, 0,
      -intensity, 1 + (intensity * 4), -intensity,
      0, -intensity, 0
    ];
    
    // Appliquer la convolution (éviter les bords)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Pour chaque canal de couleur (R, G, B)
        for (let rgb = 0; rgb < 3; rgb++) {
          let val = 0;
          
          // Appliquer le noyau de convolution
          val += data[((y - 1) * width + (x - 1)) * 4 + rgb] * kernel[0];
          val += data[((y - 1) * width + x) * 4 + rgb] * kernel[1];
          val += data[((y - 1) * width + (x + 1)) * 4 + rgb] * kernel[2];
          val += data[(y * width + (x - 1)) * 4 + rgb] * kernel[3];
          val += data[(y * width + x) * 4 + rgb] * kernel[4];
          val += data[(y * width + (x + 1)) * 4 + rgb] * kernel[5];
          val += data[((y + 1) * width + (x - 1)) * 4 + rgb] * kernel[6];
          val += data[((y + 1) * width + x) * 4 + rgb] * kernel[7];
          val += data[((y + 1) * width + (x + 1)) * 4 + rgb] * kernel[8];
          
          // Limiter les valeurs entre 0 et 255
          sharpenedData[idx + rgb] = Math.min(Math.max(val, 0), 255);
        }
      }
    }
    
    // Créer une nouvelle ImageData avec les données traitées
    return new ImageData(sharpenedData, width, height);
  }, []);
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 1 }}>
            <canvas
              ref={canvasEl}
              width={800}
              height={600}
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}
            />
          </Box>
          <ButtonGroup variant="contained" size="small" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Button 
              onClick={autoAdjust} 
              startIcon={<AutoAwesome />}
              color="primary"
              title="Ajustement automatique"
            >
              Auto
            </Button>
            <Button 
              onClick={rotateImage} 
              startIcon={<RotateRight />}
              title="Pivoter l'image de 90°"
            >
              Rotation
            </Button>
            <Button 
              onClick={flipHorizontal} 
              startIcon={<FlipHorizontal />}
              title="Retourner horizontalement"
            >
              Flip H
            </Button>
            <Button 
              onClick={flipVertical} 
              startIcon={<FlipVertical />}
              title="Retourner verticalement"
            >
              Flip V
            </Button>
            <Button 
              onClick={openCropDialog} 
              startIcon={<Crop />}
              title="Recadrer l'image"
            >
              Recadrer
            </Button>
            <Button 
              onClick={openResizeDialog} 
              startIcon={<AspectRatio />}
              title="Redimensionner l'image"
            >
              Taille
            </Button>
            <Button 
              onClick={undo} 
              startIcon={<Undo />}
              disabled={historyIndex <= 0}
              title="Annuler la dernière action"
            >
              Annuler
            </Button>
            <Button 
              onClick={reset} 
              startIcon={<Restore />}
              title="Réinitialiser l'image"
            >
              Reset
            </Button>
            <Button 
              onClick={saveImage} 
              startIcon={<Save />}
              title="Enregistrer l'image"
              color="success"
            >
              Enregistrer
            </Button>
          </ButtonGroup>
          
          {assistantVisible && (
            <AIAssistant 
              currentState={editedImage}
              lastAction={lastAction}
              isVisible={assistantVisible}
              onClose={() => setAssistantVisible(false)}
              canvasRef={canvasEl}
            />
          )}
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ButtonGroup 
              variant="outlined" 
              size="small" 
              sx={{ mb: 2, alignSelf: 'flex-end' }}
            >
              <Button 
                onClick={triggerAIAnalysis}
                startIcon={<Lightbulb />}
                color="secondary"
                title="Analyser l'image avec Google Vision AI"
              >
                Analyser
              </Button>
              <Button 
                onClick={() => setAssistantVisible(!assistantVisible)}
                startIcon={assistantVisible ? <Close /> : <Help />}
                color="secondary"
                title="Afficher/Masquer l'assistant"
              >
                {assistantVisible ? "Masquer l'assistant" : "Montrer l'assistant"}
              </Button>
            </ButtonGroup>
            
            <Accordion 
              expanded={expandedPanel === 'panel1'} 
              onChange={handleAccordionChange('panel1')}
              defaultExpanded
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Ajustements basiques</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography id="brightness-slider" variant="body2">
                      Luminosité
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Brightness6 sx={{ mr: 1, fontSize: '1rem' }} />
                      <Slider
                        value={brightness}
                        min={-1}
                        max={1}
                        step={0.01}
                        size="small"
                        onChange={(_, value) => {
                          setBrightness(value);
                          updateFilter('brightness', value);
                          setLastAction('brightness');
                        }}
                        onChangeCommitted={() => commitFilterChange('brightness')}
                        aria-labelledby="brightness-slider"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography id="contrast-slider" variant="body2">
                      Contraste
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Contrast sx={{ mr: 1, fontSize: '1rem' }} />
                      <Slider
                        value={contrast}
                        min={-1}
                        max={1}
                        step={0.01}
                        size="small"
                        onChange={(_, value) => {
                          setContrast(value);
                          updateFilter('contrast', value);
                          setLastAction('contrast');
                        }}
                        onChangeCommitted={() => commitFilterChange('contrast')}
                        aria-labelledby="contrast-slider"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography id="saturation-slider" variant="body2">
                      Saturation
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SaturationIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Slider
                        value={saturation}
                        min={-1}
                        max={1}
                        step={0.01}
                        size="small"
                        onChange={(_, value) => {
                          setSaturation(value);
                          updateFilter('saturation', value);
                          setLastAction('saturation');
                        }}
                        onChangeCommitted={() => commitFilterChange('saturation')}
                        aria-labelledby="saturation-slider"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={blackAndWhite}
                          onChange={toggleBlackAndWhite}
                          name="blackAndWhite"
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Noir et Blanc</Typography>}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            
            <Accordion 
              expanded={expandedPanel === 'panel2'} 
              onChange={handleAccordionChange('panel2')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Effets avancés</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography id="blur-slider" variant="body2">
                      Flou
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Blur sx={{ mr: 1, fontSize: '1rem' }} />
                      <Slider
                        value={blur}
                        min={0}
                        max={10}
                        step={0.1}
                        size="small"
                        onChange={(_, value) => {
                          setBlur(value);
                          updateFilter('blur', value);
                          setLastAction('blur');
                        }}
                        onChangeCommitted={() => commitFilterChange('blur')}
                        aria-labelledby="blur-slider"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography id="sharpness-slider" variant="body2">
                      Netteté
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SharpnessIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Slider
                        value={sharpness}
                        min={0}
                        max={5}
                        step={0.1}
                        size="small"
                        onChange={(_, value) => {
                          setSharpness(value);
                          updateFilter('sharpness', value);
                          setLastAction('sharpness');
                        }}
                        onChangeCommitted={() => commitFilterChange('sharpness')}
                        aria-labelledby="sharpness-slider"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sepia}
                          onChange={(e) => {
                            setSepia(e.target.checked);
                            updateFilter('sepia', e.target.checked);
                            setLastAction('filter');
                          }}
                          name="sepia"
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Effet Sépia</Typography>}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={vignette}
                          onChange={(e) => {
                            setVignette(e.target.checked);
                            updateFilter('vignette', e.target.checked);
                            setLastAction('filter');
                          }}
                          name="vignette"
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Vignette</Typography>}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography id="warmth-slider" variant="body2">
                      Température
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FilterVintage sx={{ mr: 1, fontSize: '1rem' }} />
                      <Slider
                        value={warmth}
                        min={-50}
                        max={50}
                        step={1}
                        size="small"
                        onChange={(_, value) => {
                          setWarmth(value);
                          updateFilter('warmth', value);
                          setLastAction('filter');
                        }}
                        onChangeCommitted={() => commitFilterChange('warmth')}
                        aria-labelledby="warmth-slider"
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', minWidth: 80, ml: 1 }}>
                        <Typography variant="caption">Froid</Typography>
                        <Typography variant="caption">Chaud</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            
            <Accordion 
              expanded={expandedPanel === 'panel3'} 
              onChange={handleAccordionChange('panel3')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Filtres préréglés</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {artisticFilters.map((filter) => (
                    <Grid item key={filter.id} xs={4} sm={3}>
                      <Card 
                        elevation={currentFilter === filter.id ? 3 : 1}
                        sx={{ 
                          cursor: 'pointer',
                          border: currentFilter === filter.id ? '2px solid #3f51b5' : 'none',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => applyArtisticFilter(filter.id)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="caption">
                            {filter.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>
      </Grid>
      
      {/* Dialogs remain unchanged */}
      <Dialog 
        open={cropDialogOpen} 
        onClose={() => setCropDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Recadrer l'image</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <canvas
              ref={cropCanvasRef}
              width={800}
              height={600}
              style={{ 
                border: '1px solid #ccc',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain',
                cursor: 'crosshair'
              }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Cliquez et faites glisser pour sélectionner la zone à conserver
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropDialogOpen(false)}>Annuler</Button>
          <Button onClick={applyCrop} variant="contained" color="primary">Appliquer</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog 
        open={resizeDialogOpen} 
        onClose={() => setResizeDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Redimensionner l'image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Largeur"
                  type="number"
                  fullWidth
                  value={newWidth}
                  onChange={handleWidthChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hauteur"
                  type="number"
                  fullWidth
                  value={newHeight}
                  onChange={handleHeightChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">px</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      name="maintainAspectRatio"
                      color="primary"
                    />
                  }
                  label="Conserver les proportions"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Dimensions originales: {editedImage ? `${Math.round(editedImage.width)} × ${Math.round(editedImage.height)} px` : ''}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResizeDialogOpen(false)}>Annuler</Button>
          <Button 
            onClick={applyResize} 
            variant="contained" 
            color="primary"
            disabled={newWidth <= 0 || newHeight <= 0}
          >
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ImageEditor; 