export type Language = "en" | "es";

export interface Translations {
  auth: {
    login: {
      title: string;
      tagline: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      signIn: string;
      dontHaveAccount: string;
      signUp: string;
      fillAllFields: string;
      credentialsNotFound: string;
      credentialsNotFoundDescription: string;
      createAccount: string;
      orContinueWith: string;
      google: string;
    };
    signup: {
      title: string;
      tagline: string;
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      createAccount: string;
      accountCreated: string;
      redirecting: string;
      fillAllFields: string;
      passwordsDontMatch: string;
      passwordTooShort: string;
      alreadyHaveAccount: string;
      signIn: string;
    };
    verifyEmail: {
      title: string;
      description: string;
      instructionsTitle: string;
      instruction1: string;
      instruction2: string;
      instruction3: string;
      checkButton: string;
      resendButton: string;
      emailResent: string;
      notVerified: string;
      checkError: string;
      resendError: string;
      noEmail: string;
      backToLogin: string;
      verifiedTitle: string;
      verifiedDescription: string;
    };
  };
  home: {
    greeting: {
      goodMorning: string;
      goodAfternoon: string;
      goodEvening: string;
      goodNight: string;
    };
    searchPlaceholder: string;
    sortBy: {
      recent: string;
      readingTime: string;
      title: string;
      shuffle: string;
    };
    emptyState: {
      title: string;
      description: string;
    };
    articleOptions: {
      title: string;
      archive: string;
      delete: string;
      cancel: string;
      deleteConfirmTitle: string;
      deleteConfirmMessage: string;
    };
  };
  folders: {
    title: string;
    createNewFolder: string;
    emptyState: {
      title: string;
      description: string;
    };
    createFolderModal: {
      title: string;
      placeholder: string;
      cancel: string;
      create: string;
    };
    folderOptions: {
      title: string;
      delete: string;
      cancel: string;
      deleteConfirmTitle: string;
      deleteConfirmMessage: string;
    };
    articleCount: {
      single: string;
      multiple: string;
    };
  };
  settings: {
    title: string;
    sections: {
      account: string;
      appearance: string;
      statistics: string;
      content: string;
      support: string;
    };
    account: {
      user: string;
    };
    appearance: {
      darkMode: string;
    };
    statistics: {
      viewStats: string;
      totalTime: string;
      title: string;
      quickStats: {
        totalTime: string;
        articles: string;
        pdfs: string;
      };
      streaks: {
        title: string;
        current: string;
        longest: string;
        currentLabel: string;
        longestLabel: string;
        consecutiveDays: string;
        personalRecord: string;
      };
      additional: {
        title: string;
        readingSpeed: string;
        longestSession: string;
        totalWords: string;
        totalAppTime: string;
      };
      backToSettings: string;
    };
    content: {
      exportPrint: string;
      archivedArticles: string;
      clearAllData: string;
      clearDataConfirmTitle: string;
      clearDataConfirmMessage: string;
      cancel: string;
      clearAll: string;
    };
    support: {
      help: string;
      privacy: string;
    };
    signOut: string;
    signOutConfirmTitle: string;
    signOutConfirmMessage: string;
    cancel: string;
    deleteAccount: string;
    deleteAccountModal: {
      title: string;
      description: string;
      items: {
        articles: string;
        folders: string;
        notes: string;
        statistics: string;
      };
      cancel: string;
      delete: string;
      deleting: string;
    };
    version: string;
  };
  addArticleModal: {
    title: string;
    label: string;
    placeholder: string;
    cancel: string;
    add: string;
    errors: {
      enterUrl: string;
      invalidUrl: string;
    };
    loading: {
      extracting: string;
      success: string;
    };
  };
  archived: {
    title: string;
    sortRecent: string;
    sortOldest: string;
    emptyState: {
      title: string;
      description: string;
    };
    articleOptions: {
      title: string;
      unarchive: string;
      delete: string;
      cancel: string;
      deleteConfirmTitle: string;
      deleteConfirmMessage: string;
    };
  };
  folderArticles: {
    sortRecent: string;
    sortOldest: string;
    emptyState: {
      title: string;
      description: string;
    };
    articleOptions: {
      title: string;
      archive: string;
      delete: string;
      cancel: string;
      deleteConfirmTitle: string;
      deleteConfirmMessage: string;
    };
  };
  help: {
    title: string;
    welcome: {
      title: string;
      description: string;
    };
    faq: {
      title: string;
      questions: {
        howToSave: {
          question: string;
          answer: string;
        };
        howToOrganize: {
          question: string;
          answer: string;
        };
        offline: {
          question: string;
          answer: string;
        };
        customize: {
          question: string;
          answer: string;
        };
        readingFeatures: {
          question: string;
          answer: string;
        };
        audio: {
          question: string;
          answer: string;
        };
        search: {
          question: string;
          answer: string;
        };
        archived: {
          question: string;
          answer: string;
        };
      };
    };
    contact: {
      title: string;
      email: {
        title: string;
        detail: string;
      };

    };
    tips: {
      title: string;
      organization: {
        title: string;
        text: string;
      };
      quickReading: {
        title: string;
        text: string;
      };
      statistics: {
        title: string;
        text: string;
      };
    };
  };
  privacy: {
    title: string;
    header: {
      title: string;
      description: string;
      lastUpdated: string;
    };
    sections: {
      dataCollection: {
        title: string;
        content: string;
      };
      dataUsage: {
        title: string;
        content: string;
      };
      dataSharing: {
        title: string;
        content: string;
      };
      dataSecurity: {
        title: string;
        content: string;
      };
      userRights: {
        title: string;
        content: string;
      };
      dataRetention: {
        title: string;
        content: string;
      };
      cookies: {
        title: string;
        content: string;
      };
      policyChanges: {
        title: string;
        content: string;
      };
    };
    contact: {
      title: string;
      description: string;
      email: string;
    };
    legal: {
      title: string;
      text: string;
    };
  };
  tabs: {
    home: string;
    folders: string;
    settings: string;
  };
  exportPDF: {
    title: string;
    subtitle: string;
    filterByFolder: string;
    all: string;
    selectAll: string;
    deselectAll: string;
    selected: string;
    noArticlesInFolder: string;
    exportButton: string;
    printButton: string;
    selectAtLeastOne: string;
    attention: string;
    exportingPDF: string;
    pdfDownloaded: string;
    sharePDF: string;
    pdfGenerated: string;
    errorGeneratingPDF: string;
    error: string;
    printingArticles: string;
    sentToPrint: string;
    errorPrinting: string;
    minutes: string;
    highlights: string;
    notes: string;
  };
  camera: {
    permission: {
      title: string;
      description: string;
      cancel: string;
      allow: string;
    };
    preview: {
      retake: string;
      continue: string;
      titleLabel: string;
      titlePlaceholder: string;
      titleHint: string;
      back: string;
      transcribe: string;
    };
    loading: {
      transcribing: string;
      subtitle: string;
    };
    errors: {
      captureError: string;
      transcribeError: string;
      noText: string;
    };
    success: {
      title: string;
      message: string;
      ok: string;
    };
  };
  reader: {
    actions: {
      title: string;
      exportPDF: string;
      print: string;
      tags: string;
      copyArticle: string;
      share: string;
      archive: string;
    };
    folders: {
      saveInFolder: string;
      noFolder: string;
      folderNamePlaceholder: string;
      create: string;
      newFolder: string;
      folderCreated: string;
      folderCreatedTitle: string;
      folderError: string;
      folderErrorTitle: string;
      enterFolderName: string;
    };
    notes: {
      title: string;
      addNote: string;
      placeholder: string;
      saveNote: string;
      emptyStateTitle: string;
      emptyStateDescription: string;
    };
    highlights: {
      title: string;
      emptyStateTitle: string;
      emptyStateDescription: string;
      howToHighlight: string;
      instructions: string;
      understood: string;
    };
    tags: {
      title: string;
      editTags: string;
      helpText: string;
      placeholder: string;
      saveTags: string;
    };
    images: {
      title: string;
    };
    source: {
      title: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    auth: {
      login: {
        title: "Lectora",
        tagline: "Your personal reading space",
        email: "Email",
        emailPlaceholder: "Enter your email",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        signIn: "Sign In",
        dontHaveAccount: "Don't have an account?",
        signUp: "Sign Up",
        fillAllFields: "Please fill in all fields",
        credentialsNotFound: "Credentials not found",
        credentialsNotFoundDescription: "We couldn't find an account with these credentials.",
        createAccount: "Create an account",
        orContinueWith: "Or continue with",
        google: "Continue with Google",
      },
      signup: {
        title: "Lectora",
        tagline: "Create your account",
        name: "Name",
        namePlaceholder: "Enter your name",
        email: "Email",
        emailPlaceholder: "Enter your email",
        password: "Password",
        passwordPlaceholder: "Create a password",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Confirm your password",
        createAccount: "Create Account",
        accountCreated: "✓ Account created successfully",
        redirecting: "Redirecting to login...",
        fillAllFields: "Please fill in all fields",
        passwordsDontMatch: "Passwords do not match",
        passwordTooShort: "Password must be at least 6 characters",
        alreadyHaveAccount: "Already have an account?",
        signIn: "Sign In",
      },
      verifyEmail: {
        title: "Verify Your Email",
        description: "We've sent a confirmation email to your inbox. Please verify your email to continue.",
        instructionsTitle: "How to verify:",
        instruction1: "Check your email inbox (and spam folder)",
        instruction2: "Click the confirmation link in the email",
        instruction3: "Return to this app and tap 'I've verified'",
        checkButton: "I've Verified My Email",
        resendButton: "Resend Confirmation Email",
        emailResent: "Confirmation email sent! Check your inbox.",
        notVerified: "Email not verified yet. Please check your inbox and click the confirmation link.",
        checkError: "Could not verify. Please try again.",
        resendError: "Could not resend email. Please try again.",
        noEmail: "Email address not found",
        backToLogin: "Back to Login",
        verifiedTitle: "Email Verified!",
        verifiedDescription: "Your email has been verified successfully. Redirecting to the app...",
      },
    },
    home: {
      greeting: {
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        goodNight: "Good night",
      },
      searchPlaceholder: "Search articles...",
      sortBy: {
        recent: "Recent",
        readingTime: "Reading Time",
        title: "Title",
        shuffle: "Shuffle",
      },
      emptyState: {
        title: "No articles saved yet",
        description: "Tap the + button to add your first article",
      },
      articleOptions: {
        title: "Article Options",
        archive: "Archive",
        delete: "Delete",
        cancel: "Cancel",
        deleteConfirmTitle: "Delete Article",
        deleteConfirmMessage: "Are you sure you want to delete this article?",
      },
    },
    folders: {
      title: "Folders",
      createNewFolder: "Create New Folder",
      emptyState: {
        title: "No folders yet",
        description: "Create folders to organize your articles",
      },
      createFolderModal: {
        title: "Create Folder",
        placeholder: "Folder name",
        cancel: "Cancel",
        create: "Create",
      },
      folderOptions: {
        title: "Folder Options",
        delete: "Delete",
        cancel: "Cancel",
        deleteConfirmTitle: "Delete Folder",
        deleteConfirmMessage: "Are you sure you want to delete this folder? Articles will not be deleted.",
      },
      articleCount: {
        single: "article",
        multiple: "articles",
      },
    },
    settings: {
      title: "Settings",
      sections: {
        account: "Account",
        appearance: "Appearance",
        statistics: "Statistics",
        content: "Content",
        support: "Support",
      },
      account: {
        user: "User",
      },
      appearance: {
        darkMode: "Dark Mode",
      },
      statistics: {
        viewStats: "View Statistics",
        totalTime: "Total Time",
        title: "Statistics",
        quickStats: {
          totalTime: "Total Time",
          articles: "Articles",
          pdfs: "PDFs",
        },
        streaks: {
          title: "Reading Streaks",
          current: "Current Streak",
          longest: "Longest Streak",
          currentLabel: "Current Streak",
          longestLabel: "Best Streak",
          consecutiveDays: "consecutive days",
          personalRecord: "personal record",
        },
        additional: {
          title: "Additional Statistics",
          readingSpeed: "Reading Speed",
          longestSession: "Longest Session",
          totalWords: "Total Words",
          totalAppTime: "Time in App",
        },
        backToSettings: "Settings",
      },
      content: {
        exportPrint: "Export / Print",
        archivedArticles: "Archived Articles",
        clearAllData: "Clear All Data",
        clearDataConfirmTitle: "Clear All Data",
        clearDataConfirmMessage: "This will delete all your saved articles and folders. This action cannot be undone.",
        cancel: "Cancel",
        clearAll: "Clear All",
      },
      support: {
        help: "Help & Support",
        privacy: "Privacy Policy",
      },
      signOut: "Sign Out",
      signOutConfirmTitle: "Sign Out",
      signOutConfirmMessage: "Are you sure you want to sign out?",
      cancel: "Cancel",
      deleteAccount: "Delete Account",
      deleteAccountModal: {
        title: "Delete Account?",
        description: "This action is permanent and cannot be undone. All your data will be deleted:",
        items: {
          articles: "Saved articles",
          folders: "Folders and organization",
          notes: "Notes and highlights",
          statistics: "Statistics and progress",
        },
        cancel: "Cancel",
        delete: "Delete Account",
        deleting: "Deleting...",
      },
      version: "Version",
    },
    addArticleModal: {
      title: "Add Article/Video",
      label: "Article or YouTube Video URL",
      placeholder: "https://example.com/article or youtube.com/watch?v=...",
      cancel: "Cancel",
      add: "Add",
      errors: {
        enterUrl: "Please enter a URL",
        invalidUrl: "Please enter a valid URL (must start with http:// or https://)",
      },
      loading: {
        extracting: "🔍 Extracting article...",
        success: "✅ Article added!",
      },
    },
    archived: {
      title: "Archived Articles",
      sortRecent: "Recent",
      sortOldest: "Oldest",
      emptyState: {
        title: "No archived articles",
        description: "Archived articles will appear here",
      },
      articleOptions: {
        title: "Article Options",
        unarchive: "Unarchive",
        delete: "Delete",
        cancel: "Cancel",
        deleteConfirmTitle: "Delete Article",
        deleteConfirmMessage: "Are you sure you want to delete this article?",
      },
    },
    folderArticles: {
      sortRecent: "Recent",
      sortOldest: "Oldest",
      emptyState: {
        title: "No articles yet",
        description: "Articles in this folder will appear here",
      },
      articleOptions: {
        title: "Article Options",
        archive: "Archive",
        delete: "Delete",
        cancel: "Cancel",
        deleteConfirmTitle: "Delete Article",
        deleteConfirmMessage: "Are you sure you want to delete this article?",
      },
    },
    help: {
      title: "Help & Support",
      welcome: {
        title: "Need help?",
        description: "Find answers to frequently asked questions or contact us directly.",
      },
      faq: {
        title: "Frequently Asked Questions",
        questions: {
          howToSave: {
            question: "How do I save an article?",
            answer: "You can save articles in two ways:\n\n1. Using the '+' button on the main screen and pasting the article URL\n2. Sharing the link from your browser directly to Lectora\n\nThe app will automatically extract the main content of the article, removing ads and unnecessary elements.",
          },
          howToOrganize: {
            question: "How do I organize my articles?",
            answer: "You can organize your articles using:\n\n• Custom folders\n• Tags and categories\n• Filters by date, length, or popularity\n• Archive function for read articles\n• Search by title or content",
          },
          offline: {
            question: "Can I read offline?",
            answer: "Yes! All saved articles are available for offline reading. Content is automatically downloaded when you save an article, allowing you to read anytime, anywhere.",
          },
          customize: {
            question: "How do I customize the reading experience?",
            answer: "Lectora offers multiple customization options:\n\n• Font size and type adjustment\n• Line spacing\n• Dark/light mode\n• Audio playback speed\n• Customizable highlight colors",
          },
          readingFeatures: {
            question: "What features are available while reading?",
            answer: "While reading you can:\n\n• Highlight important text\n• Add personal notes\n• Copy text fragments\n• Play the article in audio\n• Change display settings\n• Archive or delete the article",
          },
          audio: {
            question: "How does audio playback work?",
            answer: "Lectora automatically converts text to speech so you can 'read' with your ears. You can:\n\n• Adjust playback speed\n• Pause and resume at any time\n• Continue from where you left off\n• Use while doing other activities",
          },
          search: {
            question: "How do I search for specific articles?",
            answer: "Use the search bar on the main screen to find articles by:\n\n• Article title\n• Text content\n• Folder name\n• Assigned tags\n• Save date",
          },
          archived: {
            question: "What happens to archived articles?",
            answer: "Archived articles move to a special section where:\n\n• They remain saved but don't appear in your main list\n• They're still available for search\n• They can be restored at any time\n• They're included in your reading statistics",
          },
        },
      },
      contact: {
        title: "Contact",
        email: {
          title: "Email",
          detail: "monwebcreations@gmail.com",
        },
      },
      tips: {
        title: "Useful Tips",
        organization: {
          title: "💡 Organization",
          text: "Create thematic folders to keep your articles organized by categories like 'Work', 'Technology', 'Health', etc.",
        },
        quickReading: {
          title: "⚡ Quick Reading",
          text: "Use the audio feature to 'read' while exercising, cooking, or during your commute.",
        },
        statistics: {
          title: "📊 Statistics",
          text: "Check your statistics regularly to maintain a consistent reading routine and reach your goals.",
        },
      },
    },
    privacy: {
      title: "Privacy Policy",
      header: {
        title: "Your Privacy Matters",
        description: "At Lectora, we are committed to protecting your privacy and being transparent about how we collect, use, and protect your information.",
        lastUpdated: "Last updated: January 15, 2025",
      },
      sections: {
        dataCollection: {
          title: "Information We Collect",
          content: "We collect information you provide directly:\n\n• Account information (email, name)\n• Articles and content you save\n• Reading preferences and settings\n• Notes and highlights you create\n\nAutomatically collected information:\n\n• App usage data\n• Device information\n• Reading statistics\n• App performance data",
        },
        dataUsage: {
          title: "How We Use Your Information",
          content: "We use your information to:\n\n• Provide and maintain our services\n• Personalize your reading experience\n• Sync your data across devices\n• Generate personalized reading statistics\n• Improve our services and features\n• Communicate with you about updates\n• Provide technical support",
        },
        dataSharing: {
          title: "Sharing Information",
          content: "We do not sell, trade, or transfer your personal information to third parties, except:\n\n• When necessary to provide the service\n• To comply with legal obligations\n• To protect our rights and safety\n• With your explicit consent\n\nWe may share aggregated and anonymized information that doesn't personally identify you.",
        },
        dataSecurity: {
          title: "Data Security",
          content: "We implement technical and organizational security measures:\n\n• Data encryption in transit and at rest\n• Secure authentication\n• Limited access to personal data\n• Regular security monitoring\n• Secure backups\n\nHowever, no method of internet transmission is 100% secure.",
        },
        userRights: {
          title: "Your Rights",
          content: "You have the right to:\n\n• Access your personal information\n• Correct inaccurate data\n• Delete your account and data\n• Export your data\n• Limit data processing\n• Object to processing\n• Data portability\n\nYou can exercise these rights by contacting us directly.",
        },
        dataRetention: {
          title: "Data Retention",
          content: "We retain your personal information:\n\n• While you maintain an active account\n• For the time necessary to provide services\n• To comply with legal obligations\n• To resolve disputes\n\nWhen you delete your account, we will delete your personal data within 30 days, except where required by law.",
        },
        cookies: {
          title: "Cookies and Similar Technologies",
          content: "We use tracking technologies to:\n\n• Remember your preferences\n• Analyze app usage\n• Improve functionality\n• Provide personalized content\n\nYou can control these settings in your device settings.",
        },
        policyChanges: {
          title: "Policy Changes",
          content: "We may occasionally update this privacy policy. We will notify you of significant changes:\n\n• Through in-app notification\n• By email\n• Through our website\n\nYour continued use of the app after changes constitutes your acceptance of the new policy.",
        },
      },
      contact: {
        title: "Privacy Questions?",
        description: "If you have questions about this privacy policy or how we handle your information, feel free to contact us.",
        email: "monwebcreations@gmail.com",
      },
      legal: {
        title: "Legal Notice",
        text: "This privacy policy is governed by applicable data protection laws. By using Lectora, you accept the terms described in this policy.",
      },
    },
    tabs: {
      home: "Home",
      folders: "Folders",
      settings: "Settings",
    },
    exportPDF: {
      title: "Export Articles",
      subtitle: "Select the articles you want to export to PDF or print",
      filterByFolder: "Filter by Folder",
      all: "All",
      selectAll: "Select all",
      deselectAll: "Deselect all",
      selected: "selected",
      noArticlesInFolder: "No articles in this folder",
      exportButton: "Export PDF",
      printButton: "Print",
      selectAtLeastOne: "Please select at least one article to export",
      attention: "Attention",
      exportingPDF: "Generating PDF with",
      pdfDownloaded: "PDF downloaded successfully",
      sharePDF: "Share PDF",
      pdfGenerated: "PDF generated successfully at:",
      errorGeneratingPDF: "Could not generate PDF",
      error: "Error",
      printingArticles: "Printing",
      sentToPrint: "Sent to print",
      errorPrinting: "Could not print",
      minutes: "min",
      highlights: "highlights",
      notes: "notes",
    },
    camera: {
      permission: {
        title: "Camera Permission",
        description: "We need access to your camera to capture images and transcribe text.",
        cancel: "Cancel",
        allow: "Allow",
      },
      preview: {
        retake: "Retake",
        continue: "Continue",
        titleLabel: "Transcription Title",
        titlePlaceholder: "Enter a title (optional)",
        titleHint: "If you don't enter a title, one will be generated automatically from the content.",
        back: "Back",
        transcribe: "Transcribe",
      },
      loading: {
        transcribing: "Transcribing text...",
        subtitle: "This may take a few seconds",
      },
      errors: {
        captureError: "Could not capture the image",
        transcribeError: "Could not transcribe the text from the image",
        noText: "Could not extract enough text from the image. Please try again with a clearer image.",
      },
      success: {
        title: "Success",
        message: "The article has been transcribed and saved",
        ok: "OK",
      },
    },
    reader: {
      actions: {
        title: "Article Actions",
        exportPDF: "Export to PDF",
        print: "Print",
        tags: "Tags",
        copyArticle: "Copy full article",
        share: "Share",
        archive: "Archive",
      },
      folders: {
        saveInFolder: "Save in Folder",
        noFolder: "No folder",
        folderNamePlaceholder: "Folder name...",
        create: "Create",
        newFolder: "New Folder",
        folderCreated: "Folder created successfully",
        folderCreatedTitle: "Success",
        folderError: "Could not create folder",
        folderErrorTitle: "Error",
        enterFolderName: "Please enter a folder name",
      },
      notes: {
        title: "Notes",
        addNote: "Add Note",
        placeholder: "Write your note here...",
        saveNote: "Save Note",
        emptyStateTitle: "No notes yet",
        emptyStateDescription: "Add notes to remember important ideas",
      },
      highlights: {
        title: "Highlights",
        emptyStateTitle: "No highlights yet",
        emptyStateDescription: "Select text and press the highlighter button",
        howToHighlight: "How to highlight text",
        instructions: "To highlight text on your mobile device:\n\n1. Press and hold on the text you want to highlight\n\n2. A native selection menu will appear\n\n3. Select the text using the selection handles\n\n4. Press the highlighter button in the floating menu\n\nThe text will be highlighted in yellow automatically",
        understood: "Got it",
      },
      tags: {
        title: "Tags",
        editTags: "Edit Tags",
        helpText: "Separate tags with commas. For example: technology, programming, tutorial",
        placeholder: "e.g: technology, tutorial, react native",
        saveTags: "Save Tags",
      },
      images: {
        title: "Article Images",
      },
      source: {
        title: "Source",
      },
    },
  },
  es: {
    auth: {
      login: {
        title: "Lectora",
        tagline: "Tu espacio personal de lectura",
        email: "Correo electrónico",
        emailPlaceholder: "Ingresa tu correo",
        password: "Contraseña",
        passwordPlaceholder: "Ingresa tu contraseña",
        signIn: "Iniciar Sesión",
        dontHaveAccount: "¿No tienes una cuenta?",
        signUp: "Regístrate",
        fillAllFields: "Por favor completa todos los campos",
        credentialsNotFound: "Credenciales no encontradas",
        credentialsNotFoundDescription: "No pudimos encontrar una cuenta con estas credenciales.",
        createAccount: "Crear una cuenta",
        orContinueWith: "O continúa con",
        google: "Continuar con Google",
      },
      signup: {
        title: "Lectora",
        tagline: "Crea tu cuenta",
        name: "Nombre",
        namePlaceholder: "Ingresa tu nombre",
        email: "Correo electrónico",
        emailPlaceholder: "Ingresa tu correo",
        password: "Contraseña",
        passwordPlaceholder: "Crea una contraseña",
        confirmPassword: "Confirmar Contraseña",
        confirmPasswordPlaceholder: "Confirma tu contraseña",
        createAccount: "Crear Cuenta",
        accountCreated: "✓ Cuenta creada exitosamente",
        redirecting: "Redirigiendo al inicio de sesión...",
        fillAllFields: "Por favor completa todos los campos",
        passwordsDontMatch: "Las contraseñas no coinciden",
        passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
        alreadyHaveAccount: "¿Ya tienes una cuenta?",
        signIn: "Iniciar Sesión",
      },
      verifyEmail: {
        title: "Verifica tu Correo",
        description: "Hemos enviado un correo de confirmación a tu bandeja de entrada. Por favor verifica tu correo para continuar.",
        instructionsTitle: "Cómo verificar:",
        instruction1: "Revisa tu bandeja de entrada (y carpeta de spam)",
        instruction2: "Haz clic en el enlace de confirmación del correo",
        instruction3: "Vuelve a esta app y toca 'Ya he verificado'",
        checkButton: "Ya Verifiqué mi Correo",
        resendButton: "Reenviar Correo de Confirmación",
        emailResent: "¡Correo de confirmación enviado! Revisa tu bandeja.",
        notVerified: "Correo aún no verificado. Por favor revisa tu bandeja y haz clic en el enlace de confirmación.",
        checkError: "No se pudo verificar. Inténtalo de nuevo.",
        resendError: "No se pudo reenviar el correo. Inténtalo de nuevo.",
        noEmail: "Dirección de correo no encontrada",
        backToLogin: "Volver al Inicio de Sesión",
        verifiedTitle: "¡Correo Verificado!",
        verifiedDescription: "Tu correo ha sido verificado exitosamente. Redirigiendo a la app...",
      },
    },
    home: {
      greeting: {
        goodMorning: "Buenos días",
        goodAfternoon: "Buenas tardes",
        goodEvening: "Buenas tardes",
        goodNight: "Buenas noches",
      },
      searchPlaceholder: "Buscar artículos...",
      sortBy: {
        recent: "Recientes",
        readingTime: "Tiempo de Lectura",
        title: "Título",
        shuffle: "Aleatorio",
      },
      emptyState: {
        title: "No hay artículos guardados",
        description: "Toca el botón + para agregar tu primer artículo",
      },
      articleOptions: {
        title: "Opciones del Artículo",
        archive: "Archivar",
        delete: "Eliminar",
        cancel: "Cancelar",
        deleteConfirmTitle: "Eliminar Artículo",
        deleteConfirmMessage: "¿Estás seguro de que deseas eliminar este artículo?",
      },
    },
    folders: {
      title: "Carpetas",
      createNewFolder: "Crear Nueva Carpeta",
      emptyState: {
        title: "No hay carpetas",
        description: "Crea carpetas para organizar tus artículos",
      },
      createFolderModal: {
        title: "Crear Carpeta",
        placeholder: "Nombre de la carpeta",
        cancel: "Cancelar",
        create: "Crear",
      },
      folderOptions: {
        title: "Opciones de Carpeta",
        delete: "Eliminar",
        cancel: "Cancelar",
        deleteConfirmTitle: "Eliminar Carpeta",
        deleteConfirmMessage: "¿Estás seguro de que deseas eliminar esta carpeta? Los artículos no se eliminarán.",
      },
      articleCount: {
        single: "artículo",
        multiple: "artículos",
      },
    },
    settings: {
      title: "Configuración",
      sections: {
        account: "Cuenta",
        appearance: "Apariencia",
        statistics: "Estadísticas",
        content: "Contenido",
        support: "Soporte",
      },
      account: {
        user: "Usuario",
      },
      appearance: {
        darkMode: "Modo Oscuro",
      },
      statistics: {
        viewStats: "Ver Estadísticas",
        totalTime: "Tiempo Total",
        title: "Estadísticas",
        quickStats: {
          totalTime: "Tiempo Total",
          articles: "Artículos",
          pdfs: "PDFs",
        },
        streaks: {
          title: "Rachas de Lectura",
          current: "Racha Actual",
          longest: "Mejor Racha",
          currentLabel: "Racha Actual",
          longestLabel: "Mejor Racha",
          consecutiveDays: "días consecutivos",
          personalRecord: "récord personal",
        },
        additional: {
          title: "Estadísticas Adicionales",
          readingSpeed: "Velocidad de Lectura",
          longestSession: "Sesión Más Larga",
          totalWords: "Palabras Totales",
          totalAppTime: "Tiempo en App",
        },
        backToSettings: "Configuración",
      },
      content: {
        exportPrint: "Exportar / Imprimir",
        archivedArticles: "Artículos Archivados",
        clearAllData: "Borrar Todos los Datos",
        clearDataConfirmTitle: "Borrar Todos los Datos",
        clearDataConfirmMessage: "Esto eliminará todos tus artículos y carpetas guardados. Esta acción no se puede deshacer.",
        cancel: "Cancelar",
        clearAll: "Borrar Todo",
      },
      support: {
        help: "Ayuda y Soporte",
        privacy: "Política de Privacidad",
      },
      signOut: "Cerrar Sesión",
      signOutConfirmTitle: "Cerrar Sesión",
      signOutConfirmMessage: "¿Estás seguro de que deseas cerrar sesión?",
      cancel: "Cancelar",
      deleteAccount: "Eliminar Cuenta",
      deleteAccountModal: {
        title: "¿Eliminar Cuenta?",
        description: "Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos:",
        items: {
          articles: "Artículos guardados",
          folders: "Carpetas y organización",
          notes: "Notas y highlights",
          statistics: "Estadísticas y progreso",
        },
        cancel: "Cancelar",
        delete: "Eliminar Cuenta",
        deleting: "Eliminando...",
      },
      version: "Versión",
    },
    addArticleModal: {
      title: "Agregar Artículo/Video",
      label: "URL del Artículo o Video de YouTube",
      placeholder: "https://ejemplo.com/articulo o youtube.com/watch?v=...",
      cancel: "Cancelar",
      add: "Agregar",
      errors: {
        enterUrl: "Por favor ingresa una URL",
        invalidUrl: "Por favor ingresa una URL válida (debe empezar con http:// o https://)",
      },
      loading: {
        extracting: "🔍 Extrayendo artículo...",
        success: "✅ ¡Artículo agregado!",
      },
    },
    archived: {
      title: "Artículos Archivados",
      sortRecent: "Recientes",
      sortOldest: "Antiguos",
      emptyState: {
        title: "No hay artículos archivados",
        description: "Los artículos archivados aparecerán aquí",
      },
      articleOptions: {
        title: "Opciones del Artículo",
        unarchive: "Desarchivar",
        delete: "Eliminar",
        cancel: "Cancelar",
        deleteConfirmTitle: "Eliminar Artículo",
        deleteConfirmMessage: "¿Estás seguro de que deseas eliminar este artículo?",
      },
    },
    folderArticles: {
      sortRecent: "Recientes",
      sortOldest: "Antiguos",
      emptyState: {
        title: "No hay artículos",
        description: "Los artículos de esta carpeta aparecerán aquí",
      },
      articleOptions: {
        title: "Opciones del Artículo",
        archive: "Archivar",
        delete: "Eliminar",
        cancel: "Cancelar",
        deleteConfirmTitle: "Eliminar Artículo",
        deleteConfirmMessage: "¿Estás seguro de que deseas eliminar este artículo?",
      },
    },
    help: {
      title: "Ayuda y Soporte",
      welcome: {
        title: "¿Necesitas ayuda?",
        description: "Encuentra respuestas a las preguntas más frecuentes o contáctanos directamente.",
      },
      faq: {
        title: "Preguntas Frecuentes",
        questions: {
          howToSave: {
            question: "¿Cómo guardo un artículo?",
            answer: "Puedes guardar artículos de dos formas:\n\n1. Usando el botón '+' en la pantalla principal y pegando la URL del artículo\n2. Compartiendo el enlace desde tu navegador directamente a Lectora\n\nLa app extraerá automáticamente el contenido principal del artículo, eliminando anuncios y elementos innecesarios.",
          },
          howToOrganize: {
            question: "¿Cómo organizo mis artículos?",
            answer: "Puedes organizar tus artículos usando:\n\n• Carpetas personalizadas\n• Etiquetas y categorías\n• Filtros por fecha, longitud o popularidad\n• Función de archivo para artículos leídos\n• Búsqueda por título o contenido",
          },
          offline: {
            question: "¿Puedo leer sin conexión?",
            answer: "¡Sí! Todos los artículos guardados están disponibles para lectura sin conexión. El contenido se descarga automáticamente cuando guardas un artículo, permitiéndote leer en cualquier momento y lugar.",
          },
          customize: {
            question: "¿Cómo personalizo la experiencia de lectura?",
            answer: "Lectora ofrece múltiples opciones de personalización:\n\n• Ajuste de tamaño y tipo de fuente\n• Espaciado entre líneas\n• Modo oscuro/claro\n• Velocidad de reproducción de audio\n• Colores de resaltado personalizables",
          },
          readingFeatures: {
            question: "¿Qué funciones están disponibles durante la lectura?",
            answer: "Durante la lectura puedes:\n\n• Resaltar texto importante\n• Agregar notas personales\n• Copiar fragmentos de texto\n• Reproducir el artículo en audio\n• Cambiar configuración de visualización\n• Archivar o eliminar el artículo",
          },
          audio: {
            question: "¿Cómo funciona la reproducción de audio?",
            answer: "Lectora convierte automáticamente el texto a voz para que puedas 'leer' con los oídos. Puedes:\n\n• Ajustar la velocidad de reproducción\n• Pausar y reanudar en cualquier momento\n• Continuar desde donde lo dejaste\n• Usar mientras haces otras actividades",
          },
          search: {
            question: "¿Cómo busco artículos específicos?",
            answer: "Usa la barra de búsqueda en la pantalla principal para encontrar artículos por:\n\n• Título del artículo\n• Contenido del texto\n• Nombre de la carpeta\n• Etiquetas asignadas\n• Fecha de guardado",
          },
          archived: {
            question: "¿Qué pasa con los artículos archivados?",
            answer: "Los artículos archivados se mueven a una sección especial donde:\n\n• Permanecen guardados pero no aparecen en tu lista principal\n• Siguen disponibles para búsqueda\n• Pueden ser restaurados en cualquier momento\n• Se incluyen en tus estadísticas de lectura",
          },
        },
      },
      contact: {
        title: "Contacto",
        email: {
          title: "Correo",
          detail: "monwebcreations@gmail.com",
        },
      },
      tips: {
        title: "Consejos Útiles",
        organization: {
          title: "💡 Organización",
          text: "Crea carpetas temáticas para mantener tus artículos organizados por categorías como 'Trabajo', 'Tecnología', 'Salud', etc.",
        },
        quickReading: {
          title: "⚡ Lectura Rápida",
          text: "Usa la función de audio para 'leer' mientras haces ejercicio, cocinas o durante tus desplazamientos.",
        },
        statistics: {
          title: "📊 Estadísticas",
          text: "Revisa tus estadísticas regularmente para mantener una rutina de lectura constante y alcanzar tus metas.",
        },
      },
    },
    privacy: {
      title: "Política de Privacidad",
      header: {
        title: "Tu Privacidad es Importante",
        description: "En Lectora, nos comprometemos a proteger tu privacidad y ser transparentes sobre cómo recopilamos, usamos y protegemos tu información.",
        lastUpdated: "Última actualización: 15 de enero de 2025",
      },
      sections: {
        dataCollection: {
          title: "Información que Recopilamos",
          content: "Recopilamos información que nos proporcionas directamente:\n\n• Información de cuenta (email, nombre)\n• Artículos y contenido que guardas\n• Preferencias de lectura y configuraciones\n• Notas y resaltados que creas\n\nInformación recopilada automáticamente:\n\n• Datos de uso de la aplicación\n• Información del dispositivo\n• Estadísticas de lectura\n• Datos de rendimiento de la app",
        },
        dataUsage: {
          title: "Cómo Usamos tu Información",
          content: "Utilizamos tu información para:\n\n• Proporcionar y mantener nuestros servicios\n• Personalizar tu experiencia de lectura\n• Sincronizar tus datos entre dispositivos\n• Generar estadísticas de lectura personalizadas\n• Mejorar nuestros servicios y funcionalidades\n• Comunicarnos contigo sobre actualizaciones\n• Proporcionar soporte técnico",
        },
        dataSharing: {
          title: "Compartir Información",
          content: "No vendemos, intercambiamos ni transferimos tu información personal a terceros, excepto:\n\n• Cuando sea necesario para proporcionar el servicio\n• Para cumplir con obligaciones legales\n• Para proteger nuestros derechos y seguridad\n• Con tu consentimiento explícito\n\nPodemos compartir información agregada y anonimizada que no te identifique personalmente.",
        },
        dataSecurity: {
          title: "Seguridad de Datos",
          content: "Implementamos medidas de seguridad técnicas y organizativas:\n\n• Encriptación de datos en tránsito y en reposo\n• Autenticación segura\n• Acceso limitado a datos personales\n• Monitoreo regular de seguridad\n• Copias de seguridad seguras\n\nSin embargo, ningún método de transmisión por internet es 100% seguro.",
        },
        userRights: {
          title: "Tus Derechos",
          content: "Tienes derecho a:\n\n• Acceder a tu información personal\n• Corregir datos inexactos\n• Eliminar tu cuenta y datos\n• Exportar tus datos\n• Limitar el procesamiento de tus datos\n• Oponerte al procesamiento\n• Portabilidad de datos\n\nPuedes ejercer estos derechos contactándonos directamente.",
        },
        dataRetention: {
          title: "Retención de Datos",
          content: "Conservamos tu información personal:\n\n• Mientras mantengas una cuenta activa\n• Durante el tiempo necesario para proporcionar servicios\n• Para cumplir con obligaciones legales\n• Para resolver disputas\n\nCuando elimines tu cuenta, eliminaremos tus datos personales dentro de 30 días, excepto cuando la ley requiera retención.",
        },
        cookies: {
          title: "Cookies y Tecnologías Similares",
          content: "Utilizamos tecnologías de seguimiento para:\n\n• Recordar tus preferencias\n• Analizar el uso de la aplicación\n• Mejorar la funcionalidad\n• Proporcionar contenido personalizado\n\nPuedes controlar estas configuraciones en los ajustes de tu dispositivo.",
        },
        policyChanges: {
          title: "Cambios en la Política",
          content: "Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos:\n\n• Mediante notificación en la aplicación\n• Por correo electrónico\n• A través de nuestro sitio web\n\nTu uso continuado de la aplicación después de los cambios constituye tu aceptación de la nueva política.",
        },
      },
      contact: {
        title: "¿Preguntas sobre Privacidad?",
        description: "Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, no dudes en contactarnos.",
        email: "monwebcreations@gmail.com",
      },
      legal: {
        title: "Aviso Legal",
        text: "Esta política de privacidad se rige por las leyes aplicables de protección de datos. Al usar Lectora, aceptas los términos descritos en esta política.",
      },
    },
    tabs: {
      home: "Inicio",
      folders: "Carpetas",
      settings: "Configuración",
    },
    exportPDF: {
      title: "Exportar Artículos",
      subtitle: "Selecciona los artículos que deseas exportar a PDF o imprimir",
      filterByFolder: "Filtrar por Carpeta",
      all: "Todos",
      selectAll: "Seleccionar todo",
      deselectAll: "Deseleccionar todo",
      selected: "seleccionados",
      noArticlesInFolder: "No hay artículos en esta carpeta",
      exportButton: "Exportar PDF",
      printButton: "Imprimir",
      selectAtLeastOne: "Por favor selecciona al menos un artículo para",
      attention: "Atención",
      exportingPDF: "Generando PDF con",
      pdfDownloaded: "PDF descargado exitosamente",
      sharePDF: "Compartir PDF",
      pdfGenerated: "PDF generado exitosamente en:",
      errorGeneratingPDF: "No se pudo generar el PDF",
      error: "Error",
      printingArticles: "Imprimiendo",
      sentToPrint: "Enviado a impresión",
      errorPrinting: "No se pudo imprimir",
      minutes: "min",
      highlights: "resaltados",
      notes: "notas",
    },
    camera: {
      permission: {
        title: "Permiso de Cámara",
        description: "Necesitamos acceso a tu cámara para capturar imágenes y transcribir texto.",
        cancel: "Cancelar",
        allow: "Permitir",
      },
      preview: {
        retake: "Tomar otra",
        continue: "Continuar",
        titleLabel: "Título de la transcripción",
        titlePlaceholder: "Ingresa un título (opcional)",
        titleHint: "Si no ingresas un título, se generará automáticamente del contenido.",
        back: "Atrás",
        transcribe: "Transcribir",
      },
      loading: {
        transcribing: "Transcribiendo texto...",
        subtitle: "Esto puede tomar unos segundos",
      },
      errors: {
        captureError: "No se pudo capturar la imagen",
        transcribeError: "No se pudo transcribir el texto de la imagen",
        noText: "No se pudo extraer texto suficiente de la imagen. Por favor, intenta con una imagen más clara.",
      },
      success: {
        title: "Éxito",
        message: "El artículo ha sido transcrito y guardado",
        ok: "OK",
      },
    },
    reader: {
      actions: {
        title: "Acciones del Artículo",
        exportPDF: "Exportar a PDF",
        print: "Imprimir",
        tags: "Tags",
        copyArticle: "Copiar artículo completo",
        share: "Compartir",
        archive: "Archivar",
      },
      folders: {
        saveInFolder: "Guardar en Carpeta",
        noFolder: "Sin carpeta",
        folderNamePlaceholder: "Nombre de la carpeta...",
        create: "Crear",
        newFolder: "Nueva Carpeta",
        folderCreated: "Carpeta creada exitosamente",
        folderCreatedTitle: "Éxito",
        folderError: "No se pudo crear la carpeta",
        folderErrorTitle: "Error",
        enterFolderName: "Por favor ingresa un nombre para la carpeta",
      },
      notes: {
        title: "Notas",
        addNote: "Añadir Nota",
        placeholder: "Escribe tu nota aquí...",
        saveNote: "Guardar Nota",
        emptyStateTitle: "No hay notas aún",
        emptyStateDescription: "Agrega notas para recordar ideas importantes",
      },
      highlights: {
        title: "Resaltados",
        emptyStateTitle: "No hay resaltados aún",
        emptyStateDescription: "Selecciona texto y presiona el botón de resaltador",
        howToHighlight: "Cómo resaltar texto",
        instructions: "Para resaltar texto en tu dispositivo móvil:\n\n1. Mantén presionado sobre el texto que deseas resaltar\n\n2. Aparecerá un menú de selección nativo de tu dispositivo\n\n3. Selecciona el texto usando los controladores de selección\n\n4. Presiona el botón del menú flotante\n\nEl texto se resaltará en amarillo automáticamente",
        understood: "Entendido",
      },
      tags: {
        title: "Tags",
        editTags: "Editar Tags",
        helpText: "Separa las tags con comas. Por ejemplo: tecnología, programación, tutorial",
        placeholder: "Ej: tecnología, tutorial, react native",
        saveTags: "Guardar Tags",
      },
      images: {
        title: "Imágenes del artículo",
      },
      source: {
        title: "Fuente",
      },
    },
  },
};
