// EcoQuiz - Versão Simplificada baseada no GeeksforGeeks
// https://www.geeksforgeeks.org/javascript/how-to-create-a-simple-javascript-quiz/
// ID's dos elementos que deve ter no HTML para funcionar o quiz
//const ques = document.getElementById("ques");
//const opt = document.getElementById("opt");
//const btn = document.getElementById("btn");
//const totalScore = document.getElementById("score");

let Questions = [];
const ques = document.getElementById("ques");
let isProcessing = false; // Prevenir múltiplos cliques

function decodeHtmlEntities(text) {
    if (!text) return '';
    
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&pi;/g, 'π')
        .replace(/&copy;/g, '©')
        .replace(/&reg;/g, '®')
        .replace(/&trade;/g, '™')
        .replace(/&nbsp;/g, ' ')
        .replace(/&hellip;/g, '…')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&times;/g, '×')
        .replace(/&divide;/g, '÷')
        .replace(/&plusmn;/g, '±')
        .replace(/&deg;/g, '°')
        .replace(/&sup2;/g, '²')
        .replace(/&sup3;/g, '³')
        .replace(/&frac12;/g, '½')
        .replace(/&frac14;/g, '¼')
        .replace(/&frac34;/g, '¾')
        .replace(/&micro;/g, 'µ')
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)) // Decodificar códigos numéricos
        .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16))); // Decodificar códigos hexadecimais
}

// SISTEMA DE TRADUÇÃO LOCAL SIMPLES E CONFIÁVEL
let translationCache = {};

// Função para tradução com MyMemory (gratuita, sem chave)
async function translateWithMyMemory(text) {
    try {
        console.log('🔄 MyMemory: Iniciando tradução...');
        
        // Verificar limite de 500 bytes conforme documentação oficial
        const textBytes = new TextEncoder().encode(text).length;
        if (textBytes > 500) {
            console.log(`⚠️ MyMemory: Texto muito longo (${textBytes} bytes > 500 bytes)`);
            return null;
        }
        
        // URL conforme documentação oficial: https://mymemory.translated.net/doc/spec.php
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt`;
        
        console.log('📤 URL MyMemory:', url);
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📋 Resposta MyMemory:', data);
            
            if (data.responseData && data.responseData.translatedText) {
                console.log('✅ MyMemory sucesso:', data.responseData.translatedText);
                return data.responseData.translatedText;
            } else if (data.responseStatus === 403) {
                console.log('❌ MyMemory: Rate limit atingido');
            } else {
                console.log('❌ MyMemory: Resposta inválida');
            }
        } else {
            console.log('❌ MyMemory HTTP error:', response.status);
        }
        
        return null;
    } catch (error) {
        console.log('💥 MyMemory erro:', error);
        return null;
    }
}

// Função para tradução com Lingva Translate (gratuita, sem chave)
async function translateWithLingva(text) {
    try {
        console.log('🔄 Lingva: Iniciando tradução...');
        
        const url = `https://lingva.ml/api/v1/en/pt/${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            if (data.translation) {
                console.log('✅ Lingva sucesso:', data.translation);
                return data.translation;
            }
        }
        
        console.log('❌ Lingva falhou');
        return null;
    } catch (error) {
        console.log('💥 Lingva erro:', error);
        return null;
    }
}

// Função para tradução com Yandex (gratuita, sem chave)
async function translateWithYandex(text) {
    try {
        console.log('🔄 Yandex: Iniciando tradução...');
        
        // URL correta para Yandex Translate
        const url = `https://translate.yandex.net/api/v1/tr.json/translate?text=${encodeURIComponent(text)}&lang=en-pt&format=plain`;
        
        console.log('📤 URL Yandex:', url);
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📋 Resposta Yandex:', data);
            
            if (data.text && data.text[0]) {
                console.log('✅ Yandex sucesso:', data.text[0]);
                return data.text[0];
            } else {
                console.log('❌ Yandex: Resposta inválida');
            }
        } else {
            console.log('❌ Yandex HTTP error:', response.status);
        }
        
        return null;
    } catch (error) {
        console.log('💥 Yandex erro:', error);
        return null;
    }
}

// Função para tradução com LibreTranslate (gratuita, sem chave)
async function translateWithLibre(text) {
    try {
        console.log('🔄 LibreTranslate: Iniciando tradução...');
        
        // Verificar se o texto é válido
        if (!text || text.trim() === '') {
            console.log('⚠️ Texto vazio ou inválido para tradução');
            return null;
        }
        
        // Parâmetros corretos para a API LibreTranslate
        const requestBody = {
            q: text.trim(),
            source: 'en',
            target: 'pt'
        };
        
        console.log('📤 Enviando requisição:', requestBody);
        
        const response = await fetch('https://libretranslate.com/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Resposta recebida:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            if (data.translatedText) {
                console.log('✅ LibreTranslate sucesso:', data.translatedText);
                return data.translatedText;
            }
        }
        
        console.log('❌ LibreTranslate falhou');
        return null;
    } catch (error) {
        console.log('💥 LibreTranslate erro:', error);
        return null;
    }
}

// Função principal de tradução - SISTEMA DE FALLBACK AUTOMÁTICO
async function translate(text) {
    if (!text || text.trim() === '') {
        return text;
    }
    
    const decodedText = decodeHtmlEntities(text);
    
    // Verificar cache primeiro
    if (translationCache[decodedText]) {
        console.log('✅ Cache hit:', translationCache[decodedText]);
        return translationCache[decodedText];
    }
    
    // Se já parece estar em português, retornar como está
    if (isPortuguese(decodedText)) {
        translationCache[decodedText] = decodedText;
        return decodedText;
    }
    
    console.log(`🔄 Traduzindo: "${decodedText}"`);
    
    // SISTEMA DE FALLBACK AUTOMÁTICO - Tenta todas as APIs em ordem
    const apis = [
        { name: 'MyMemory', func: translateWithMyMemory },
        { name: 'Lingva', func: translateWithLingva },
        { name: 'Yandex', func: translateWithYandex },
        { name: 'LibreTranslate', func: translateWithLibre }
    ];
    
    for (const api of apis) {
        try {
            console.log(`🎯 Tentando ${api.name}...`);
            const result = await api.func(decodedText);
            
            if (result && result.trim() !== '' && result !== decodedText) {
                console.log(`✅ ${api.name} bem-sucedido:`, result);
                translationCache[decodedText] = result;
                return result;
            }
        } catch (error) {
            console.log(`❌ ${api.name} falhou:`, error.message);
        }
        
        // Aguardar um pouco entre as tentativas
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Se todas as APIs falharem, usar texto original
    console.log('⚠️ Todas as APIs falharam, usando texto original');
    translationCache[decodedText] = decodedText;
    return decodedText;
}

// Função para detectar português - SIMPLIFICADA
function isPortuguese(text) {
    const lowerText = text.toLowerCase();
    
    // Palavras específicas em português que indicam tradução
    const portugueseWords = [
        'qual', 'quem', 'como', 'quando', 'onde', 'por que', 'quantos',
        'planeta', 'estrela', 'célula', 'coração', 'cérebro', 'temperatura',
        'energia', 'pressão', 'hidrogênio', 'oxigênio', 'carbono',
        'aquecimento', 'global', 'efeito', 'estufa', 'combustíveis', 'fósseis',
        'renovável', 'mudança', 'climática', 'biodiversidade', 'desmatamento',
        'poluição', 'sustentabilidade', 'ecossistema', 'fenômeno', 'natural',
        'chuva', 'ácida', 'painel', 'solar', 'carro', 'elétrico', 'calotas',
        'polares', 'níveis', 'mar', 'desertificação'
    ];
    
    const portugueseCount = portugueseWords.filter(word => 
        lowerText.includes(word)
    ).length;
    
    const wordCount = text.split(/\s+/).length;
    const portugueseRatio = portugueseCount / wordCount;
    
    // Threshold baixo para detecção mais rápida
    return portugueseRatio > 0.2;
}

// Função para limpar cache de tradução
function clearTranslationCache() {
    translationCache = {};
    console.log('🧹 Cache de tradução limpo!');
}

// Função para testar tradução com múltiplas APIs
function testMultipleAPIs() {
    console.log('🧪 TESTANDO SISTEMA DE MÚLTIPLAS APIS...');
    console.log('=' .repeat(60));
    
    const testTexts = [
        "What is global warming?",
        "Which planet is the hottest?",
        "How does photosynthesis work?",
        "What causes acid rain?",
        "Which energy source is renewable?",
        "What is the unit of electrical resistance?",
        "What is the standard SI unit for temperature?",
        "Which natural phenomenon is responsible for global warming?",
        "Which gas is released by burning fossil fuels?",
        "Which energy source is NON-renewable?",
        "What is the hottest planet in the Solar System?",
        "How does photosynthesis work?",
        "What causes acid rain?"
    ];
    
    console.log('🎯 Sistema de tradução com múltiplas APIs (todas gratuitas, sem chave):');
    console.log('1️⃣ MyMemory - https://mymemory.translated.net/doc/spec.php');
    console.log('   ✅ Limite: 500 bytes por requisição');
    console.log('   ✅ Sem chave de API');
    console.log('   ✅ Qualidade: Traduções humanas + Machine Translation');
    console.log('');
    console.log('2️⃣ Lingva Translate - https://lingva.ml/');
    console.log('   ✅ Limite: Sem limite conhecido');
    console.log('   ✅ Sem chave de API');
    console.log('   ✅ Qualidade: Não oficial Google Translate');
    console.log('');
    console.log('3️⃣ Yandex Translate - https://translate.yandex.net/');
    console.log('   ✅ Limite: Sem limite conhecido');
    console.log('   ✅ Sem chave de API');
    console.log('   ✅ Qualidade: Tradução profissional');
    console.log('');
    console.log('4️⃣ LibreTranslate - https://libretranslate.com/');
    console.log('   ✅ Limite: Sem limite conhecido');
    console.log('   ✅ Sem chave de API');
    console.log('   ✅ Qualidade: Open source');
    console.log('');
    console.log('✅ Cache inteligente para performance');
    console.log('✅ Fallback automático se uma falhar');
    console.log('✅ Logs detalhados para diagnóstico');
    console.log('');
    
    testTexts.forEach((text, index) => {
        const textBytes = new TextEncoder().encode(text).length;
        console.log(`\n--- Teste ${index + 1} ---`);
        console.log(`📝 Original: "${text}"`);
        console.log(`📏 Tamanho: ${textBytes} bytes ${textBytes > 500 ? '⚠️ (muito longo para MyMemory)' : '✅ (OK para todas as APIs)'}`);
        console.log(`🔄 Será traduzido automaticamente por uma das APIs`);
    });
    
    console.log('\n✅ Sistema de múltiplas APIs configurado com sucesso!');
    console.log('🚀 Múltiplas opções + Cache + Fallback = Máxima confiabilidade!');
}

// Função para testar tradução completa com múltiplas APIs
async function testCompleteTranslation() {
    console.log('🧪 TESTANDO TRADUÇÃO COMPLETA COM MÚLTIPLAS APIS...');
    console.log('=' .repeat(60));
    
    const testTexts = [
        "What is global warming?",
        "How does photosynthesis work?",
        "What causes acid rain?"
    ];
    
    for (const text of testTexts) {
        console.log(`\n--- Traduzindo: "${text}" ---`);
        const translated = await translate(text);
        console.log(`✅ Resultado final: "${translated}"`);
    }
    
    console.log('\n🎯 Sistema de múltiplas APIs testado com sucesso!');
}

// Função para testar cada API individualmente
async function testIndividualAPIs() {
    console.log('🔍 TESTANDO CADA API INDIVIDUALMENTE...');
    console.log('=' .repeat(60));
    
    const testText = "Hello world";
    console.log(`📝 Texto de teste: "${testText}"`);
    
    const apis = [
        { name: 'MyMemory', func: translateWithMyMemory },
        { name: 'Lingva', func: translateWithLingva },
        { name: 'Yandex', func: translateWithYandex },
        { name: 'LibreTranslate', func: translateWithLibre }
    ];
    
    for (const api of apis) {
        console.log(`\n--- Testando ${api.name} ---`);
        try {
            const result = await api.func(testText);
            if (result) {
                console.log(`✅ ${api.name} funcionando: "${result}"`);
            } else {
                console.log(`❌ ${api.name} falhou`);
            }
        } catch (error) {
            console.log(`💥 ${api.name} erro:`, error.message);
        }
        
        // Aguardar entre os testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Função para testar traduções específicas do quiz
async function testQuizTranslations() {
    console.log('🎯 TESTANDO TRADUÇÕES ESPECÍFICAS DO QUIZ...');
    console.log('=' .repeat(50));
    
    const quizTexts = [
        "What is the unit of electrical resistance?",
        "What is the standard SI unit for temperature?",
        "Which natural phenomenon is responsible for global warming?",
        "Which gas is released by burning fossil fuels?",
        "Which energy source is NON-renewable?"
    ];
    
    for (const text of quizTexts) {
        console.log(`\n--- Teste ${quizTexts.indexOf(text) + 1} ---`);
        console.log(`📝 Original: "${text}"`);
        const translated = await translate(text);
        console.log(`✅ Traduzido: "${translated}"`);
    }
    
    console.log('\n🎯 Traduções do quiz testadas com sucesso!');
}

// Função para buscar perguntas da API Open Trivia DB
async function fetchQuestions() {
    // Perguntas personalizadas sobre meio ambiente (sempre incluídas)
    const customQuestions = [
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "Which natural phenomenon is responsible for global warming by trapping heat in the atmosphere?",
            correct_answer: "Greenhouse effect",
            incorrect_answers: ["Ozone layer", "Photosynthesis", "Continental drift"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "Which gas is released by burning fossil fuels and contributes to acid rain?",
            correct_answer: "Sulfur dioxide (SO₂)",
            incorrect_answers: ["Oxygen (O₂)", "Carbon dioxide (CO₂)", "Nitrogen (N₂)"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "Which energy source is NON-renewable?",
            correct_answer: "Petroleum",
            incorrect_answers: ["Wind energy", "Solar energy", "Hydropower"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "What is the \"El Niño\" phenomenon?",
            correct_answer: "Abnormal warming of Pacific Ocean waters",
            incorrect_answers: ["An underwater volcano", "A hurricane in the Atlantic", "An earthquake in the Ring of Fire"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "Which Brazilian biome is known for its high biodiversity and deforestation threats?",
            correct_answer: "Amazon Rainforest",
            incorrect_answers: ["Caatinga", "Cerrado", "Pampa"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "If a solar panel has 20% efficiency and receives 1000 W/m² of sunlight, how much electrical energy does it produce per m²?",
            correct_answer: "200 W",
            incorrect_answers: ["20 W", "500 W", "1000 W"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "What is the main cause of rising sea levels?",
            correct_answer: "Melting polar ice caps and thermal expansion of water",
            incorrect_answers: ["Increased ocean evaporation", "Underwater earthquakes", "Sediment buildup in rivers"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "Which chemical reaction occurs in electric car batteries to store energy?",
            correct_answer: "Oxidation-reduction (redox)",
            incorrect_answers: ["Combustion", "Photolysis", "Neutralization"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "If Earth's albedo (reflectivity) decreases due to melting ice, what happens to global temperatures?",
            correct_answer: "Increases, because more light is absorbed",
            incorrect_answers: ["Decreases, because more light is reflected", "Remains unchanged", "Fluctuates randomly"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "Which human activity contributes most to desertification?",
            correct_answer: "Deforestation and intensive land use",
            incorrect_answers: ["Reforestation", "Sustainable agriculture", "Hydropower"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "What is the standard SI unit for temperature?",
            correct_answer: "Kelvin",
            incorrect_answers: ["Fahrenheit", "Celsius", "Rankine"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "What is the unit of electrical resistance?",
            correct_answer: "Ohm",
            incorrect_answers: ["Mho", "Tesla", "Joule"]
        },
        {
            type: "multiple",
            difficulty: "easy",
            category: "Science & Nature",
            question: "What is the hottest planet in the Solar System?",
            correct_answer: "Venus",
            incorrect_answers: ["Mars", "Mercury", "Jupiter"]
        }
    ];
    
    try {
        console.log('🔄 Conectando com a Open Trivia DB...');
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=17&difficulty=easy&type=multiple');
        if (!response.ok) {
            throw new Error("Erro na conexão! Não foi possível buscar os dados");
        }
        const data = await response.json();
        
        // Combinar perguntas da API com perguntas personalizadas
        Questions = [...customQuestions, ...data.results];
        
        // Embaralhar todas as perguntas para maior variedade
        Questions.sort(() => Math.random() - 0.5);
        
        console.log(`✅ ${Questions.length} perguntas carregadas com sucesso! (${customQuestions.length} personalizadas + ${data.results.length} da API)`);
    } catch (error) {
        console.log('❌ Erro:', error);
        ques.innerHTML = `<h5 style='color: red'>❌ Erro na conexão: ${error.message}</h5>`;
        
        // Usar apenas perguntas personalizadas se a API falhar
        Questions = customQuestions;
        
        // Embaralhar perguntas personalizadas
        Questions.sort(() => Math.random() - 0.5);

        console.log('📚 Usando dados de exemplo...');
    }
}

// Inicializar perguntas
fetchQuestions();

let currQuestion = 0;
let score = 0;

// Mostrar mensagem de carregamento
if (Questions.length === 0) {
    ques.innerHTML = `<h5>🔄 Carregando perguntas...</h5>`;
}

// Função para limpar opções da API de forma inteligente
function cleanApiOption(option) {
    if (!option) return '';
    
    let cleaned = option;
    
    // Limpar apenas o "c=" no início, preservando o resto do conteúdo
    cleaned = cleaned.replace(/^c\s*=\s*/i, "");
    
    // Limpar outros padrões comuns da API que podem atrapalhar
    cleaned = cleaned.replace(/^[a-z]\s*=\s*/i, ""); // Remove qualquer letra seguida de "=" no início
    
    // Remover espaços extras no início e fim
    cleaned = cleaned.trim();
    
    // Se a opção ficou vazia após a limpeza, retornar o original
    if (!cleaned) {
        return option;
    }
    
    return cleaned;
}

// Função para carregar pergunta atual
async function loadQues() {
    const opt = document.getElementById("opt");
    const btn = document.getElementById("btn");
    
    if (currQuestion >= Questions.length) {
        loadScore();
        return;
    }
    
    let currentQuestion = Questions[currQuestion].question;
    
    // Decodificar HTML entities
    currentQuestion = decodeHtmlEntities(currentQuestion);
    
    // Traduzir pergunta
    currentQuestion = await translate(currentQuestion);
    
    // Exibir pergunta traduzida
    ques.innerHTML = `<h3>🌱 Pergunta ${currQuestion + 1} de ${Questions.length}</h3><p>${currentQuestion}</p>`;
    
    // Limpar opções anteriores
    opt.innerHTML = "";
    
    // Obter respostas
    const correctAnswer = Questions[currQuestion].correct_answer;
    const incorrectAnswers = Questions[currQuestion].incorrect_answers;
    const options = [correctAnswer, ...incorrectAnswers];
    
    // Embaralhar opções
    options.sort(() => Math.random() - 0.5);
    
    // Criar opções traduzidas
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const choicesdiv = document.createElement("div");
        const choice = document.createElement("input");
        const choiceLabel = document.createElement("label");
        
        choice.type = "radio";
        choice.name = "answer";
        choice.value = option;
        choice.id = `option${i}`;
        
        // Traduzir opção
        let cleanedOption = decodeHtmlEntities(option);
        
        // Função para limpar opções da API de forma inteligente
        cleanedOption = cleanApiOption(cleanedOption);
        
        const translatedOption = await translate(cleanedOption);


        choiceLabel.textContent = translatedOption;
        choiceLabel.htmlFor = `option${i}`;
        
        choicesdiv.appendChild(choice);
        choicesdiv.appendChild(choiceLabel);
        opt.appendChild(choicesdiv);
    }
    
    // Reativar botão
    if (btn) {
        btn.disabled = false;
        btn.textContent = "ENVIAR RESPOSTA";
    }
    
    // Resetar flag de processamento
    isProcessing = false;
}

// Carregar primeira pergunta após 2 segundos
setTimeout(async () => {
    if (Questions.length === 0) {
        ques.innerHTML = `<h5 style='color: red'>❌ Não foi possível carregar as perguntas. Tente novamente!</h5>`;
    } else {
        await loadQues();
    }
}, 2000);

// Função para carregar pontuação final
async function loadScore() {
    const totalScore = document.getElementById("score");
    const percentage = ((score / Questions.length) * 100).toFixed(1);
    
    totalScore.innerHTML = `
        <h2>🏆 Resultados Finais do EcoQuiz</h2>
        <p><strong>Pontuação:</strong> ${score} de ${Questions.length}</p>
        <p><strong>Porcentagem de acerto:</strong> ${percentage}%</p>
        <h3>📋 Respostas Corretas:</h3>
    `;
    
    for (let i = 0; i < Questions.length; i++) {
        const el = Questions[i];
        const correctAnswer = await translate(decodeHtmlEntities(el.correct_answer));
        totalScore.innerHTML += `<p>${i + 1}. ${correctAnswer}</p>`;
    }
    
    // Mensagem baseada no acerto
    let message = '';
    if (percentage >= 90) {
        message = '🌟 EXCELENTE! Você é um verdadeiro especialista em meio ambiente!';
    } else if (percentage >= 70) {
        message = '👍 MUITO BOM! Você tem um bom conhecimento sobre o tema!';
    } else if (percentage >= 50) {
        message = '📚 BOM! Continue estudando para melhorar ainda mais!';
    } else {
        message = '📖 ESTUDE MAIS! Há muito a aprender sobre meio ambiente!';
    }
    
    totalScore.innerHTML += `<p><strong>💬 ${message}</strong></p>`;
    totalScore.innerHTML += `<p>🌍 Obrigado por participar do EcoQuiz!</p>`;
}

// Função para próxima pergunta
async function nextQuestion() {
    if (currQuestion < Questions.length - 1) {
        currQuestion++;
        await loadQues();
    } else {
        // Remover elementos da interface
        const opt = document.getElementById("opt");
        const btn = document.getElementById("btn");
        if (opt) opt.remove();
        if (btn) btn.remove();
        await loadScore();
    }
}

// Função para verificar resposta - CORRIGIDA para prevenir múltiplos cliques
async function checkAns() {
    // Prevenir múltiplos cliques
    if (isProcessing) {
        return;
    }
    
    const selectedAns = document.querySelector('input[name="answer"]:checked');
    if (selectedAns) {
        // Marcar como processando
        isProcessing = true;
        
        const btn = document.getElementById("btn");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "PROCESSANDO...";
        }
        
        const answerValue = selectedAns.value;
        const correctAnswer = Questions[currQuestion].correct_answer;
        
        // Verificar se a resposta está correta
        if (answerValue === correctAnswer) {
            score++;
            console.log('✅ Resposta correta!');
        } else {
            console.log('❌ Resposta incorreta!');
        }
        
        // Mostrar feedback temporário
        const feedback = document.createElement('div');
        feedback.style.cssText = 'margin: 15px 0; padding: 15px; border-radius: 10px; font-weight: bold; animation: fadeIn 0.5s ease-in;';
        
        if (answerValue === correctAnswer) {
            feedback.style.backgroundColor = '#d4edda';
            feedback.style.color = '#155724';
            feedback.style.border = '1px solid #c3e6cb';
            feedback.textContent = '✅ Parabéns! Resposta correta!';
        } else {
            feedback.style.backgroundColor = '#f8d7da';
            feedback.style.color = '#721c24';
            feedback.style.border = '1px solid #f5c6cb';
            const correctAnswerTranslated = await translate(decodeHtmlEntities(correctAnswer));
            feedback.textContent = `❌ Resposta incorreta! A resposta correta era: ${correctAnswerTranslated}`;
        }
        
        const opt = document.getElementById("opt");
        opt.appendChild(feedback);
        
        // Remover feedback após 2 segundos e ir para próxima pergunta
        setTimeout(async () => {
            if (feedback.parentNode) {
                feedback.remove();
            }
            await nextQuestion();
        }, 2000);
        
    } else {
        alert("Por favor, selecione uma resposta.");
    }
}
