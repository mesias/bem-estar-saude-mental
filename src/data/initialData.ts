import { Campaign, AssessmentForm, FormResponse, ClinicalIntervention, UserProfile } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'mgr-01',
    name: 'Mariana Rocha',
    email: 'mariana.gestao@escolas.org',
    role: 'manager',
    departmentOrSchool: 'Diretoria de Gestão e Saúde do Trabalhador',
  },
  {
    uid: 'psy-01',
    name: 'Dr. Carlos Eduardo Medeiros',
    email: 'carlos.psicologia@clinica.org',
    role: 'psychologist',
    departmentOrSchool: 'Núcleo de Apoio Psicológico Docente (CRP 06/145892)',
  },
  {
    uid: 'usr-01',
    name: 'Profª. Ana Beatriz Silveira',
    email: 'ana.silveira@educacao.gov.br',
    role: 'user',
    departmentOrSchool: 'Colégio Estadual Dom Pedro II - Língua Portuguesa',
  },
  {
    uid: 'usr-02',
    name: 'Prof. Marcos Vinícius Lima',
    email: 'marcos.lima@educacao.gov.br',
    role: 'user',
    departmentOrSchool: 'Escola Municipal Paulo Freire - Matemática',
  },
  {
    uid: 'usr-03',
    name: 'Profª. Juliana Carvalho',
    email: 'juliana.carvalho@educacao.gov.br',
    role: 'user',
    departmentOrSchool: 'Instituto de Educação - Biologia',
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-teacher-mind-care-01',
    title: 'Bem-Estar Saúde Mental do Professor (Flagship Institucional)',
    description: 'Estudo de Coorte Longitudinal Semanal para monitoramento do estresse ocupacional, prevenção de burnout e intervenções clínicas imediatas. Professores respondem semanalmente sobre sua semana de trabalho via notificação push/e-mail programada.',
    targetAudience: 'Professores da Educação Básica e Ensino Médio',
    status: 'active',
    isFlagship: true,
    notificationMode: 'strict_deadlines',
    deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderFrequency: 'weekly',
    createdByManagerId: 'mgr-01',
    createdByName: 'Mariana Rocha (Coord. Pesquisa & RH)',
    assignedPsychologistIds: ['psy-01'],
    participantCount: 60,
    responseCount: 42,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    researchMetadata: {
      academicLevel: 'flagship_study',
      studyDesign: 'longitudinal_weekly',
      universityOrInstitute: 'Instituto de Psicologia & Núcleo de Estudos em Saúde Ocupacional',
      graduateProgram: 'Programa de Pós-Graduação em Psicologia (PPGP / Linha Saúde Mental e Trabalho)',
      leadResearcher: 'Dra. Mariana Rocha & Dr. Carlos Medeiros',
      academicAdvisor: 'Prof. Dr. Armando Silveira (Professor Titular)',
      ethicsApprovalCode: 'CEP/CONEP CAAE: 54910222.4.0000.5404',
      longitudinalTotalWeeks: 12,
      currentWeekIndex: 4,
      weeklyNotificationDay: 'sunday',
      weeklyNotificationTime: '19:00',
      sampleTargetSize: 60,
      anonymizeInExports: true,
    }
  },
  {
    id: 'camp-mestrado-burnout-2026',
    title: 'Dissertação de Mestrado: Regulação Emocional e Esgotamento Docente',
    description: 'Investigação empírica quantitativa analisando o efeito mediador do suporte institucional entre carga horária extraclasse e exaustão emocional.',
    targetAudience: 'Professores de Redes Públicas e Privadas',
    status: 'active',
    notificationMode: 'strict_deadlines',
    deadlineDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderFrequency: 'every_3_days',
    createdByManagerId: 'mgr-01',
    createdByName: 'Mestranda Luiza Fontes (Bolsista CAPES)',
    assignedPsychologistIds: ['psy-01'],
    participantCount: 45,
    responseCount: 28,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    researchMetadata: {
      academicLevel: 'mestrado',
      studyDesign: 'cross_sectional',
      universityOrInstitute: 'Universidade Federal / Instituto de Psicologia',
      graduateProgram: 'PPGP - Programa de Pós-Graduação em Psicologia Social e do Trabalho',
      leadResearcher: 'Luiza Fontes (Pesquisadora Mestrado)',
      academicAdvisor: 'Profa. Dra. Helena Siqueira',
      ethicsApprovalCode: 'CEP CAAE: 88123924.1.0000.5289',
      sampleTargetSize: 50,
      anonymizeInExports: true,
    }
  },
  {
    id: 'camp-doutorado-micro-intervencoes-2026',
    title: 'Tese de Doutorado: Ensaio de Micro-Intervenções Parassimpáticas (4-7-8)',
    description: 'Ensaio quase-experimental longitudinal avaliando a eficácia de técnicas de respiração curta na atenuação do estresse agudo pré-aula.',
    targetAudience: 'Professores do Ensino Fundamental com Sintomas de Ansiedade',
    status: 'active',
    notificationMode: 'flexible_discretionary',
    deadlineDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderFrequency: 'weekly',
    createdByManagerId: 'mgr-01',
    createdByName: 'Doutorando Thiago Albuquerque (PPGP)',
    assignedPsychologistIds: ['psy-01'],
    participantCount: 80,
    responseCount: 39,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    researchMetadata: {
      academicLevel: 'doutorado',
      studyDesign: 'experimental_rct',
      universityOrInstitute: 'Universidade Estadual / Laboratório de Neurociência Comportamental',
      graduateProgram: 'Doutorado em Psicologia Clínica e Neurociências',
      leadResearcher: 'Thiago Albuquerque (Pesquisador Doutorado)',
      academicAdvisor: 'Prof. Dr. Ricardo Mendonça',
      ethicsApprovalCode: 'CEP CAAE: 92481023.7.0000.5149',
      longitudinalTotalWeeks: 8,
      currentWeekIndex: 5,
      weeklyNotificationDay: 'friday',
      weeklyNotificationTime: '17:00',
      sampleTargetSize: 80,
      anonymizeInExports: true,
    }
  }
];

export const INITIAL_FORMS: AssessmentForm[] = [
  {
    id: 'form-teacher-wellbeing-01',
    campaignId: 'camp-teacher-mind-care-01',
    title: 'Avaliação de Bem-Estar e Sobrecarga Docente (WHO-5 Adaptado)',
    description: 'Questionário confidencial para mensurar níveis de vitalidade, sono, estresse laboral e identificar necessidade de suporte psicológico imediato.',
    psychologistId: 'psy-01',
    psychologistName: 'Dr. Carlos Eduardo Medeiros',
    safetyThreshold: 45, // Wellbeing score <= 45 triggers risk alert
    personalizedResources: [
      {
        id: 'res-01',
        title: 'Plantão Psicológico de Emergência & Linha 188 (CVV)',
        description: 'Suporte emocional gratuito, confidencial e imediato disponível 24 horas por dia. Seus dados geraram um alerta de cuidado prioritário.',
        category: 'crisis_helpline',
        minScore: 0,
        maxScore: 45,
        actionText: 'Ligar 188 (Apoio Gratuito 24h)',
        actionUrlOrPhone: 'tel:188',
      },
      {
        id: 'res-02',
        title: 'Técnica de Acalmia Respiratória 4-7-8 (Áudio Guiado)',
        description: 'Exercício rápido de regulação parassimpática para diminuir taquicardia e ansiedade aguda antes ou após as aulas.',
        category: 'breathing_exercise',
        minScore: 0,
        maxScore: 60,
        actionText: 'Iniciar Exercício Guiado',
      },
      {
        id: 'res-03',
        title: 'Agendamento com a Equipe de Psicologia Ocupacional',
        description: 'Converse diretamente com o Dr. Carlos Eduardo ou psicólogos parceiros da campanha para acompanhamento individualizado.',
        category: 'support_channel',
        minScore: 0,
        maxScore: 70,
        actionText: 'Solicitar Atendimento Online',
        actionUrlOrPhone: 'mailto:carlos.psicologia@clinica.org',
      },
      {
        id: 'res-04',
        title: 'Guia Prático: Higiene do Sono e Limites com Trabalho Remoto',
        description: 'Estratégias validadas para desconectar de grupos de mensagens de alunos e recuperar energia física e mental.',
        category: 'article',
        minScore: 45,
        maxScore: 100,
        actionText: 'Ler Guia de Autocuidado',
      }
    ],
    questions: [
      {
        id: 'q1_sleep',
        text: 'Nas últimas duas semanas, como você avalia a qualidade do seu sono ao acordar?',
        type: 'options',
        required: true,
        helpText: 'Selecione a alternativa que mais reflete seus dias.',
        options: [
          'Excelente e revigorante',
          'Boa na maioria das noites',
          'Regular, com despertares noturnos',
          'Ruim, acordo cansado com frequência',
          'Péssima, insônia constante'
        ],
        weight: 15,
        isRiskIndicator: true
      },
      {
        id: 'q2_stress_slider',
        text: 'Em uma escala de 0 a 10, qual o nível de estresse e sobrecarga você sente no dia a dia da sala de aula?',
        type: 'slider',
        required: true,
        min: 0,
        max: 10,
        step: 1,
        minLabel: '0 - Totalmente tranquilo',
        maxLabel: '10 - Esgotamento extremo',
        weight: 20,
        isRiskIndicator: true
      },
      {
        id: 'q3_overtime_hours',
        text: 'Quantas horas semanais, em média, você dedica a tarefas escolares fora da sua jornada contratual (correções, planejamentos, atendimento a pais)?',
        type: 'numbers',
        required: true,
        min: 0,
        max: 60,
        helpText: 'Informe apenas números inteiros em horas.',
        weight: 10
      },
      {
        id: 'q4_teaching_stage',
        text: 'Qual é o segmento de ensino em que você leciona predominantemente?',
        type: 'dropdowns',
        required: true,
        options: [
          'Educação Infantil',
          'Ensino Fundamental I (1º ao 5º ano)',
          'Ensino Fundamental II (6º ao 9º ano)',
          'Ensino Médio',
          'Educação de Jovens e Adultos (EJA)',
          'Gestão Pedagógica / Coordenação'
        ],
        weight: 5
      },
      {
        id: 'q5_symptoms',
        text: 'Selecione os sinais físicos ou emocionais que você vivenciou recentemente:',
        type: 'checkboxes',
        required: false,
        options: [
          'Sensação de cansaço crônico que não passa após descanso',
          'Tensão muscular ou dores na nuca e coluna',
          'Ansiedade ou aperto no peito no trajeto para a escola',
          'Irritabilidade incomum com colegas ou estudantes',
          'Sensação de que o trabalho perdeu o sentido',
          'Nenhum dos sintomas acima'
        ],
        weight: 20,
        isRiskIndicator: true
      },
      {
        id: 'q6_reflection',
        text: 'Espaço aberto: Gostaria de compartilhar alguma situação específica ou fator que tem pesado em sua rotina profissional?',
        type: 'text',
        required: false,
        helpText: 'Suas respostas são tratadas com sigilo ético pela equipe de psicologia.'
      },
      {
        id: 'q7_attachment',
        text: 'Anexo complementar (opcional: laudo, diário de reflexão ou atestado recente)',
        type: 'file',
        required: false,
        helpText: 'Formatos aceitos: PDF, JPG, PNG (máx. 5MB).'
      }
    ],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_RESPONSES: FormResponse[] = [
  {
    id: 'resp-001',
    campaignId: 'camp-teacher-mind-care-01',
    campaignTitle: 'Cuidado da Saúde Mental do Professor',
    formId: 'form-teacher-wellbeing-01',
    formTitle: 'Avaliação de Bem-Estar e Sobrecarga Docente (WHO-5 Adaptado)',
    userId: 'usr-01',
    userName: 'Profª. Ana Beatriz Silveira',
    userEmail: 'ana.silveira@educacao.gov.br',
    userDepartment: 'Colégio Estadual Dom Pedro II - Língua Portuguesa',
    answers: {
      q1_sleep: 'Péssima, insônia constante',
      q2_stress_slider: 9,
      q3_overtime_hours: 18,
      q4_teaching_stage: 'Ensino Médio',
      q5_symptoms: [
        'Sensação de cansaço crônico que não passa após descanso',
        'Ansiedade ou aperto no peito no trajeto para a escola',
        'Sensação de que o trabalho perdeu o sentido'
      ],
      q6_reflection: 'Sinto que não dou conta de corrigir todas as redações e as turmas de 45 alunos têm gerado crises de ansiedade diárias.',
      q7_attachment: 'diario_reflexao_outubro.pdf'
    },
    calculatedScore: 28, // Below safety threshold (45) -> Alert!
    riskLevel: 'critical',
    isRiskAlert: true,
    alertAcknowledged: false,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'resp-002',
    campaignId: 'camp-teacher-mind-care-01',
    campaignTitle: 'Cuidado da Saúde Mental do Professor',
    formId: 'form-teacher-wellbeing-01',
    formTitle: 'Avaliação de Bem-Estar e Sobrecarga Docente (WHO-5 Adaptado)',
    userId: 'usr-02',
    userName: 'Prof. Marcos Vinícius Lima',
    userEmail: 'marcos.lima@educacao.gov.br',
    userDepartment: 'Escola Municipal Paulo Freire - Matemática',
    answers: {
      q1_sleep: 'Regular, com despertares noturnos',
      q2_stress_slider: 6,
      q3_overtime_hours: 8,
      q4_teaching_stage: 'Ensino Fundamental II (6º ao 9º ano)',
      q5_symptoms: [
        'Tensão muscular ou dores na nuca e coluna',
        'Sensação de cansaço crônico que não passa após descanso'
      ],
      q6_reflection: 'A carga horária está pesada, mas ainda mantenho boa relação com as turmas. Gostaria de mais tempo de planejamento conjunto.'
    },
    calculatedScore: 58,
    riskLevel: 'moderate',
    isRiskAlert: false,
    alertAcknowledged: true,
    acknowledgedBy: 'Dr. Carlos Eduardo Medeiros',
    acknowledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'resp-003',
    campaignId: 'camp-teacher-mind-care-01',
    campaignTitle: 'Cuidado da Saúde Mental do Professor',
    formId: 'form-teacher-wellbeing-01',
    formTitle: 'Avaliação de Bem-Estar e Sobrecarga Docente (WHO-5 Adaptado)',
    userId: 'usr-03',
    userName: 'Profª. Juliana Carvalho',
    userEmail: 'juliana.carvalho@educacao.gov.br',
    userDepartment: 'Instituto de Educação - Biologia',
    answers: {
      q1_sleep: 'Boa na maioria das noites',
      q2_stress_slider: 3,
      q3_overtime_hours: 3,
      q4_teaching_stage: 'Ensino Médio',
      q5_symptoms: ['Nenhum dos sintomas acima'],
      q6_reflection: 'Ano letivo com boa receptividade dos alunos do laboratório.'
    },
    calculatedScore: 86,
    riskLevel: 'low',
    isRiskAlert: false,
    alertAcknowledged: true,
    acknowledgedBy: 'Dr. Carlos Eduardo Medeiros',
    acknowledgedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_INTERVENTIONS: ClinicalIntervention[] = [
  {
    id: 'int-001',
    responseId: 'resp-001',
    userId: 'usr-01',
    userName: 'Profª. Ana Beatriz Silveira',
    psychologistId: 'psy-01',
    psychologistName: 'Dr. Carlos Eduardo Medeiros',
    actionType: 'urgent_consultation',
    notes: 'Realizado primeiro contato telefônico acolhedor. Professora relatou sintomas de esgotamento e pânico matinal. Encaminhada para sessão de telepsicologia emergencial agendada para amanhã às 14h.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];
