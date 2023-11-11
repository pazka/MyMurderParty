export const CHAR_TYPES = {
    "LAWFUL": "LAWFUL",
    "BAD": "BAD",
    "TECH": "TECH",
    "INVESTIGATOR": "INVESTIGATOR",
    "SCIENTIFIC": "SCIENTIFIC",
}

export const TROMBINOSCOPE: Trombinoscope = {
    "1_ESCALADE": {
        "id": "1_ESCALADE",
        "name": "Marc Lavoie",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/1_ESCALADE.png",
        "scenario": {
            public: `Vous êtes un grimpeur aveugle à la suite d'une expérience raté avec le scientifique.

Avec une accuité auditive hors du commun, vous avez développé une **technique de grimpe unique**. **Vous resenter plus de choses que la moyenne avec vos mains**. 

Vous étiez un bon ami du scientifique`,
            private: "Vous recherchez la vérité sur les travaux du scientifique et chercher du sens à vos super sens"
        },
        "types": [CHAR_TYPES.LAWFUL]
    },
    "2_CRYPTO": {
        "id": "2_CRYPTO",
        "name": "Alex Myster",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/2_CRYPTO.png",
        "scenario": {
            public: `Célèbre Expert en cryptographie et compréhension de donnée numérique.
            
Collègue distant du scientifique, vous avez toujours été en compétition avec lui, mais sa mort vous creuse un vide.`,
            private: "Vous chercher à comprendre la mort du scientifique qui vous peine et peut-être reprendre ses travaux"
        },
        "types": [CHAR_TYPES.LAWFUL, CHAR_TYPES.TECH]
    },
    "3_PHYS": {
        "id": "3_PHYS",
        "name": "Mme Pigius Glouton",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/3_PHYS.png",
        "scenario": {
            public: `Vous êtes une physicienne de renomée mondiale, mais plus pour votre passion dévorante pour les pigeon que vos travaux. 
            
Vous avez collaboré avec le scientifique pendant plusieurs années avant de vous consacrer pleinement à votre passion pour les pigeons. Vous avez très faim.

Vous avez une connaissance approfondie des travaux du scientifique et de ses recherches.`,
            private: `Vous saviez que le scientifique travailait sur le voyage temporel. Mais trop de **gens malveillant** s'intéressait à ses travaux et vous **gardez donc cet aspect de sa recherche secret** autant que possible. 

VOus voulez trouver ce qui s'est passé et protéger ses travaux.`
        },
        "types": [CHAR_TYPES.LAWFUL, CHAR_TYPES.SCIENTIFIC]
    },
    "4_DETECTIVE": {
        "id": "4_DETECTIVE",
        "name": "Richard Money",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/4_DETECTIVE.png",
        "scenario": {
            public: `Vraisemblablement la seule personne autorisée à entrer dans le laboratoire du scientifique. Vous êtes un détective privé de renomée mondiale.

Votre oeil afuté et votre esprit de déduction vous permettent de voir des choses que personne ne voit.            

Vous portez une arme (demander au MJ)`,
            private: `Vous avez été contacté par le scientifique avant sa mort pour enquêter sur des menaces qui pesaient sur lui. 
            
Arrivé trop tard, vous êtes déterminé à trouver le coupable.`
        },
        "types": [CHAR_TYPES.LAWFUL, CHAR_TYPES.INVESTIGATOR]
    },
    "5_DET_ASSISTANT": {
        "id": "5_DET_ASSISTANT",
        "name": "Remi·e Chevalier",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/5_DET_ASSISTANT.png",
        "scenario": {
            public: `Vous êtes l'assistant.e du Détective Richard Money. Vous avez des compétences en investigation. 

Votre oeil afuté et votre esprit de déduction vous permettent de voir des choses que personne ne voit. 

Vous portez une arme (demander au MJ)`,
            private: `Vous êtes un·e Illuminati. Le grand conseil vous avait dit que les travaux du scientifique doievnt à tout finir entre les main de clan. 

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui.

Vous suivez le détective pour vous **rapprocher le plus possible des travaux du scientifique**. Mais vous êtes bien déterminé à faire le nécessaire pour en **emparer le moment venu**. 


Vous couchez avec \`Sophie Latech\`, la femme de Mr Bitanmin Sponsor du scientifique, Vous vous dites tout ensemble et **vous vous aidez mutuellement**.`
        },
        "types": [CHAR_TYPES.BAD, CHAR_TYPES.INVESTIGATOR],
    },
    "6_SPONSOR": {
        "id": "6_SPONSOR",
        "name": "Henry Bitanmin",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/6_SPONSOR.png",
        "scenario": {
            public: `Vous êtes le sponsor du scientifique. Vous avez investi des millions dans ses recherches et vous êtes le seul à avoir accès à certain de ses travaux sans les comprendre.`,
            private: `Vous êtes un Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**, c'est pour ça qu'il vous finance vous-même. 
            
Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui.
Vous êtes marié à \`Sophie Latech\` mais le mariage bat de l'aile. Elle a préféré garder son nom pour des raisons compréhensibles.`
        },
        "types": [CHAR_TYPES.BAD],
    },
    "7_TECHGIRL": {
        "id": "7_TECHGIRL",
        "name": "Sophie Latech",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/7_TECHGIRL.png",
        "scenario": {
            public: `Vous êtes la femme de \`Mr Bitanmin\`, le sponsor du scientifique. Vous êtes une experte en informatique et en technologie.`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**, c'est pour ça qu'il vous finance vous-même.

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui.

Vous êtes marié à \`Mr Bitanmin\` mais le mariage bat de l'aile. Vous détestez son nom par exemple. 

C'est pour ça que vous le trompez avec \`Remi Chevalier\` l'assistant du détective. Vous vous dites tout ensemble et **vous vous aidez mutuellement**.`
        },
        "types": [CHAR_TYPES.BAD, CHAR_TYPES.TECH],
    },
    "8_PNJ_1": {
        "id": "8_PNJ_1",
        "name": "Jean Valmont",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/8_PNJ_1.png",
        "scenario": {
            public: `Vous êtes un passant déterminé qui a réussi à rentrer dans ce labo pendant la confusion. Le truc bizarre c'est que vous êtes déguisé en Radar (???)
Vous êtes un peu perdu mais vous avez l'air de savoir ce que vous faites.`,
            private: `Vous êtes un ancien Illuminati. Le clan voulait que le scientifique finisse ses travaux.
            
Vous savez que le conseil a envoyé d'autres agents dans la pièce, mais ne pouvez pas le révéler de peur de vous faire descendre. Vous savez que \`Remi Chevalier\` et \`Henry Bitanmin\` sont des agents du clan, mais qui d'autre ...

Vous avez été banni du clan pour avoir révélé des secrets. Vous êtes déterminé à vous venger en les empechant de parvenir à leurs fins et en aidant les gentils`
        },
        "types": [CHAR_TYPES.LAWFUL],
    },
    "9_PNJ_2": {
        "id": "8_PNJ_2",
        "name": "Victor Marceau",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/9_PNJ_2.png",
        "scenario": {
            public: `Vous êtes un passant déterminé qui a réussi à rentrer dans ce labo pendant la confusion. Vous êtes un peu perdu mais vous avez l'air de savoir ce que vous faites.`,
            private: `Vous êtes un ancien Illuminati. Le clan voulait que le scientifique finisse ses travaux.

Vous savez que le conseil a envoyé d'autres agents dans la pièce, mais ne pouvez pas le révéler de peur de vous faire descendre. Vous savez que \`Remi Chevalier\` et \`Anne Leroy\` sont des agents du clan, mais qui d'autre ...

Vous avez été banni du clan pour avoir révélé des secrets. Vous êtes déterminé à vous venger en les empechant de parvenir à leurs fins et en aidant les gentils`,
        },
        "types": [CHAR_TYPES.LAWFUL],
    },
    "10_PNJ_BIO": {
        "id": "10_PNJ_BIO",
        "name": "Dr Elisa Corbin",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/10_PNJ_BIO.png",
        "scenario": {
            public: `Vous êtes une scientifique experte en biologie. Vous êtes là parce que vous aimez le drama, qu'est-ce que vous foutez là ?`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**.

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui. Vous ne faites pas confiance à \`Jean Valmont\` ni \`Victor Marceau\` car ils ont trahi le clan.

Mais vous ne pouvez pas le révéler de peur de vous faire descendre.`,
        },
        "types": [CHAR_TYPES.BAD],
    },
    "11_PNJ_4": {
        "id": "11_PNJ_4",
        "name": "Mme Clara Morille",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/11_PNJ_4.png",
        "scenario": {
            public: `Vous êtes la secrétaire du scientifique. Vous êtes là pour faire le ménage et ranger les affaires du scientifique. Vous savez tout de lui.`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**.

Vous connaissez tout les membres du clan : 
- \`Remi Chevalier\`
- \`Henry Bitanmin\`
- \`Sophie Latech\`
- \`Dr Elisa Corbin\`
- \`Anne Leroy\`
- \`Jean Valmont\` traite au clan
- \`Victor Marceau\` traitre au clan
`,
        },
        "types": [CHAR_TYPES.BAD],
    },
    "12_PNJ_5": {
        "id": "12_PNJ_5",
        "name": "Anne Leroy",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/12_PNJ_5.png",
        "scenario": {
            public: `Vous êtes la femme du Détective \`Richard Money\`, vous êtes là car vous vouliez voir à quoi ressemblait son travail.`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui. Vous ne faites pas confiance à \`Jean Valmont\` ni \`Victor Marceau\` car ils ont trahi le clan.

Vous êtes là pour faire mine de faire avancer l'enquête mais tentez juste d'empecher votre mari et les non-illuminati de découvrir la vérité sur le travaux du scientifique.
`},
        types: [CHAR_TYPES.BAD],
    },
}

export const GAME_NAME = "La mort du mysterieux Dr Vaticant"
export const GAME_DESCRIPTION = `Vous vous retrouvez réuni·e·s dans le laboratoire du scientifique \`Dr Vaticant\` dont vous n'avez jamais bien compris le travail. 

Sa mort a été déclarée mais aucun supect n'est encore connu. Tout le monde accours pour y voir plus clair, seules les personnes présente dans la pièce ont pu se procurer un accès.

**Suivez les indices, utilisez votre esprit de déduction pour découvrir comment le scientifique est mort et peut-être enfin comprendre l'ampleur de son travail !**

PS : Des armes sont présentes dans le jeu et peuvent être utilisées pour assomer d'autres joueur·se·s. Un·e Joueur·se assomé doit se laisser prendre ses objets et faire le mort pendant 1 minute. Iel peut ensuite se relever et continuer à jouer avec pleine connaissance de ce qui vient de se passer.
`


export const FULL_INVENTORY: Inventory = {
    "ARME_1": {
        id: "ARME_1",
        name: "matraque du détective",
        description: `Une matraque avec le nom \`Richard Money\` gravé dessus`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/ARME_1.png",
        canBeTaken: true,

        toPrintIrl: true,
        variations: {
        },
        lookActions: [],
        useActions: [{
            conditions: {},
            results: [
                {
                    broadcastMessage: {
                        variant: "warning",
                        message: "Vous entendez une forte détonation de révolver",
                    },
                }
            ]
        }],
    }, "ARME_2": {
        id: "ARME_2",
        name: "matraque de l'assitant détective",
        description: `Une matraque avec le nom \`Remi Chevalier\` gravé dessus`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/ARME_2.png",
        canBeTaken: true,

        toPrintIrl: true,
        variations: {
        },
        lookActions: [],
        useActions: [{
            conditions: {},
            results: [
                {
                    broadcastMessage: {
                        variant: "warning",
                        message: "Vous entendez une forte détonation de révolver",
                    },
                }
            ]
        }],
    }, "ARME_3": {
        id: "ARME_3",
        name: "matraque",
        description: "Une matraque sans marquage particulier",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/ARME_3.png",
        canBeTaken: true,

        toPrintIrl: true,
        variations: {
        },
        lookActions: [],
        useActions: [{
            conditions: {},
            results: [
                {
                    broadcastMessage: {
                        variant: "warning",
                        message: "Vous entendez une forte détonation de révolver",
                    },
                }
            ]
        }],
    }, "ORDNI_LOCK": {
        id: "ORDNI_LOCK",
        name: "Ordinateur du professeur bloqué",
        description: "L'ordinateur du professeur est bloqué avec un mot de passe ",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/COMPUTER.png",
        canBeTaken: true,
        toPrintIrl: true,
        variations: {
            "ORDI_HACKABLE": {
                name: "Ordinateur facilement hackable",
                description: "L'ordinateur du professuer est facilement hackable pour vos compétence",
                canBeTaken: true,
                variations: {},
                lookActions: [],
                useActions: [{
                    conditions: {
                        needsOneOfCharacterType: [CHAR_TYPES.TECH],
                    },
                    results: [
                        {
                            replaceByItemId: "ORDI_UNLOCKED",
                        }
                    ]
                }]
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterType: [CHAR_TYPES.TECH],
            },
            results: [
                {
                    displayVariationId: "ORDI_HACKABLE",
                }
            ]
        }],
        useActions: [],
    },
    "ORDI_UNLOCKED": {
        id: "ORDI_UNLOCKED",
        name: "Ordinateur du professeur débloqué",
        description: "L'ordinateur du professeur est débloqué",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/COMPUTER.png",
        canBeTaken: true,

        variations: {
        },
        lookActions: [],
        useActions: [{
            conditions: {

            },
            results: [
                {
                    giveItemIds: ["FINANCE_BOOK", "RESEARCH_PAPER_1"]
                }
            ]
        }],
    },
    "FINANCE_BOOK": {
        id: "FINANCE_BOOK",
        name: "Fichier des comptes du professeur",
        description: "Fichier des comptes du professeur, vous ne comprenez pas grand chose mais vous voyez que le professeur a reçu des fonds de \`Henry Bitanmin\`, quelquechose d'autre s'y cache peut etre..",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/FINANCE_BOOK.png",
        canBeTaken: true,

        variations: {
            "FINANCE_BOOK_INVESTIGATOR": {
                name: "Fichier des comptes du professeur",
                description: `Fichier des comptes du professeur.
                
Vous voyez que le professeur a reçu des fonds de \`Henry Bitanmin\`.
Les nom de comptes correspondent à des codes que vous avez dàja vu sur des affaires lié au Illuminati, Mr Bitanmin en est donc un !`,
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterType: [CHAR_TYPES.INVESTIGATOR],
            },
            results: [{
                displayVariationId: "FINANCE_BOOK_INVESTIGATOR",
            }]
        }],
        useActions: [],
    },
    "RESEARCH_PAPER_1": {
        id: "RESEARCH_PAPER_1",
        name: "Recherche du professeur Opportunité",
        description: "Recherche du professeur sur les opportunités, vous ne comprenez pas grand chose, c'est très scientifique.",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/RESEARCH_PAPER_1.png",
        canBeTaken: true,
        variations: {
            "RESEARCH_PAPER_1_SCIENTIST": {
                name: "Recherche du professeur",
                description: `Recherche du professeur, c'est très scientifique.

Vous comprenez que le professur a construit une machine à remonter le temps !!
En fonction de la cible de la machine, on peut accéder à des opportunités différentes. ou peut-être que c'est l'inverse ?`}
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterType: [CHAR_TYPES.SCIENTIFIC],
            },
            results: [{
                displayVariationId: "RESEARCH_PAPER_1_SCIENTIST",
            }]
        }],
        useActions: []
    },
    "CLEF_CARREE": {
        id: "CLEF_CARREE",
        name: "Clé carrée",
        description: "Une clé carrée",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/CLEF_CARREE.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "MAINTENACE_TOOL": {
        id: "MAINTENACE_TOOL",
        name: "Outil de maintenance",
        description: "Outil de maintenance pour débrouillage",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/MAINTENACE_TOOL.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "AMBER": {
        id: "AMBER",
        name: "Ambre Préhistorique",
        description: `Ambre préhistorique avec une étiquette marquée: \`Cible ADN Pr Mach. Temp.\``,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/AMBER.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "METEORITE": {
        id: "METEORITE",
        name: "Object étrange",
        description: `On dirait une pierre mais mou, il semble n'avoir aucun poids
Il y a une étiquette marquée : \`Cible ADN Pr Mach. Temp.\``,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/METEORITE.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "EGG": {
        id: "EGG",
        name: "Gros Oeuf",
        description: `C'est un gros oeuf non identifié, il y a des trace de sang dessus. Qu'est-ce que ça peut bien être ?`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/EGG.png",
        canBeTaken: true,
        variations: {
            "DINO_EGG": {
                name: "Gros Oeuf de dinosaure",
                description: `C'est un gros oeuf de dinosaure, il y a des trace de sang dessus.`,
            }
        },
        lookActions: [
            {
                conditions: {
                    needsOneOfCharacterId: ["10_PNJ_BIO"],
                },
                results: [
                    {
                        displayVariationId: "DINO_EGG",
                    }
                ]
            }
        ],
        useActions: []
    },
    "CAMERA_RECORDING": {
        id: "CAMERA_RECORDING",
        name: "Enregistrement de caméra",
        description: `Enregistrement de caméra de surveillance
        
On y voit la machine fonctionner et le professeur en sortir attivement avec un object dans les mains. 

Il se dirige en courant vers la salle du coffre fort et y entre.

30 seconde après on voit un dinosaure sortir de la machine et se cacher dans le laboratoire.

Le professeur revient dans le salon, et commence à démonter la machine. 

Le dinosaure sort de sa cachette et se dirige vers le professeur. Il s'effraie et tombe et se cogne la tête sur la table basse. Il meurt sur le coup.

Le dinosaure se dirige vers le professeur et le dévore. Il ne reste qu'un doigt qui roule sous le canapé.

Le dinosaure se dirige vers la salle du coffre fort et y entre.

- Fin de l'enregistrement -`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/CAMERA_RECORDING.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "HIGH_SECURITY_CAMERA": {
        id: "HIGH_SECURITY_CAMERA",
        name: "Caméra de sécurité",
        description: `Caméra de sécurité placée en hauteur.

        Personne de normal ne peut l'atteindre.`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/HIGH_SECURITY_CAMERA.png",
        canBeTaken: false,
        toPrintIrl: true,
        variations: {
            "HIGH_SECURITY_CAMERA_ESCALADE": {
                name: "Caméra de sécurité",
                description: `Caméra de sécurité placée en hauteur.

                Vous pouvez l'atteindre en escaladant le mur.`,
                useActions: [{
                    conditions: {},
                    results: [
                        {
                            giveItemIds: ["CAMERA_RECORDING"],
                        }
                    ]
                }],
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterId: ["1_ESCALADE"],
            },
            results: [
                {
                    displayVariationId: "HIGH_SECURITY_CAMERA_ESCALADE",
                }
            ]
        }],
        useActions: []
    },
    "SD_CARD": {
        id: "SD_CARD",
        name: "Carte SD",
        description: `Carte SD de la caméra de sécurité, vous avez besoin d'un pc pour la visioner`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/SD_CARD.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {},
            results: [
                {
                    giveItemIds: ["CAMERA_RECORDING"],
                }
            ]
        }]
    },
    "FINAL_MACHINE": {
        id: "FINAL_MACHINE",
        name: "Machine complète",
        description: `Elle vibre et fait du bruit, elle est allumée et affiche un message \`En attente d'une cible ADN\``,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/MACHINE.png",
        canBeTaken: false,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfObjectsId: ["AMBER", "EGG"],
            },
            results: [
                {
                    triggerEndOfGame: [{
                        "caractersTypeId": [CHAR_TYPES.LAWFUL],
                        "hasWon": true,
                        "popUpMessage": {
                            variant: "success",
                            message: "Vous avez fini les travaux du scientique et avec ouvert un portail vers les ressources infinies de la préhistoire !"
                        }
                    }, {
                        "caractersTypeId": [CHAR_TYPES.BAD],
                        "hasWon": false,
                        "popUpMessage": {
                            variant: "error",
                            message: "Vous n'avez pas réussi à diriger les travaux du scientifique vers la fin du monde, vous avez perdu !"
                        }
                    }]
                }
            ]
        }, {
            conditions: {
                needsOneOfObjectsId: ["METEORITE"],
            },
            results: [
                {
                    triggerEndOfGame: [{
                        "caractersTypeId": [CHAR_TYPES.BAD],
                        "hasWon": true,
                        "popUpMessage": {
                            variant: "magic",
                            message: "Vous sentez un trou noir se former, signifiant la fin du monde. Vous avez accompli l'objectif des Illuminati."
                        }
                    }, {
                        "caractersTypeId": [CHAR_TYPES.LAWFUL],
                        "hasWon": false,
                        "popUpMessage": {
                            variant: "error",
                            message: "Vous sentez un trou noir se former, signifiant la fin du monde, vous avez perdu !"
                        }
                    }]
                }
            ]
        }]
    },
    "INCOMPLETE_MACHINE_2": {
        id: "INCOMPLETE_MACHINE_2",
        name: "Machine incomplète mais allumée",
        description: `Elle vibre et est allumée mais affiche un message en rouge \`En attente du module ADN\``,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/MACHINE.png",
        canBeTaken: false,
        variations: {},
        lookActions: [],
        useActions: [
            {
                conditions: {
                    needsOneOfObjectsId: ["ADN_MODULE"],
                },
                results: [
                    {
                        replaceByItemId: "FINAL_MACHINE",
                    }
                ]
            }
        ]
    },
    "INCOMPLETE_MACHINE_1": {
        id: "INCOMPLETE_MACHINE_1",
        name: "Machine incomplète et éteinte",
        description: `Cette machine est bizarre et ressemble à un portail.
        
Elle est éteinte et semble manquer un élément pour fonctionner.`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/MACHINE.png",
        canBeTaken: false,
        toPrintIrl: true,
        variations: {},
        lookActions: [],
        useActions: [
            {
                conditions: {
                    needsOneOfObjectsId: ["POWER_BANK"],
                },
                results: [
                    {
                        replaceByItemId: "INCOMPLETE_MACHINE_2",
                    }
                ]
            }]
    },
    "ADN_MODULE": {
        id: "ADN_MODULE",
        name: "Module ADN",
        description: `Un gros morceau de fer et d'eléctronique marquée \`Module ADN\``,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/ADN_MODULE.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "POWER_BANK": {
        id: "POWER_BANK",
        name: "Batterie nucléaire",
        description: `Une grosse batterie Duracell marquée \`Batterie Nucléaire\``,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/POWER_BANK.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "LOCKER_CODE_3_HIGH": {
        id: "LOCKER_CODE_3_HIGH",
        name: "Code de casier N°3",
        description: `Ces codes sont accrochés au plafond et inaccesibles sans escalade.`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_CODE_3.png",
        canBeTaken: false,
        variations: {
            "LOCKER_CODE_3_VIEW": {
                name: "Code de casier N°3",
                description: `Vous pouvez aisément récupérer ce code grace a votre scalade`,
                useActions: [{
                    conditions: {},
                    results: [
                        {
                            giveItemIds: ["LOCKER_CODE_3"],
                        }
                    ]
                }]
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterId: ["1_ESCALADE"],
            },
            results: [
                {
                    displayVariationId: "LOCKER_CODE_3_VIEW",
                }
            ]
        }],
        useActions: []
    },
    "LOCKER_CODE_3": {
        id: "LOCKER_CODE_3",
        name: "Code de casier N°3",
        description: `Code de casier N°3`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_CODE_3.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "CRYPTED_COMPUTER": {
        id: "CRYPTED_COMPUTER",
        name: "Un Ordinateur crypté",
        description: `Ordinateur fixe avec un contenu crypté affiché à l'écran. Qui peut les décrypter ?`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/COMPUTER.png",
        canBeTaken: false,
        toPrintIrl: true,
        variations: {
            "CRYPTED_COMPUTER_CRYPTO": {
                name: "Ordinateur décrypté",
                description: `Ordinateur décrypté. Vous y lisez le contenu d'un rapport sur les expériences du scientifique : 
                
## test 1 
ADN spatial : Quazi-echec. J'ai du tout couper avant une catastrophe

## test 2 

ADN préhistorique d'ambre : Bingo ! J'ai accès à des ressources infinies !`,
            }
        },
        lookActions: [
            {
                conditions: {
                    needsOneOfCharacterId: ["2_CRYPTO"],
                },
                results: [
                    {
                        displayVariationId: "CRYPTED_COMPUTER_CRYPTO",
                    }
                ]
            }
        ],
        useActions: []
    },
    "LOCKER_CODE_2_CRYPTED": {
        id: "LOCKER_CODE_2_CRYPTED",
        name: "Code de casier N°2 crypté",
        description: `Des codes marqués 'casier N°2' mais le code semble anormal, comme codé avec une clef de cryptage...`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_CODE_2.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfCharacterId: ["2_CRYPTO"],
            },
            results: [
                {
                    replaceByItemId: "LOCKER_CODE_2",
                }
            ]
        }]
    },
    "LOCKER_CODE_2": {
        id: "LOCKER_CODE_2",
        name: "Code de casier N°2",
        description: `Le code du casier N°2 en clair !`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_CODE_2.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "DOIGT": {
        id: "DOIGT",
        name: "Un doigt humain",
        description: "Un doigt ensanglanté, arraché par la force ! A qui appartien-t-il ?",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/DOIGT.png",
        canBeTaken: true,
        toPrintIrl: true,
        variations: {
            DOIGT_INVESTIGATOR: {
                description: "Un doigt ensanglanté, vous identifiez qu'il appartient au scientifique !",
            }
        },
        lookActions: [{
            conditions: {
                needsOneOfCharacterType: [CHAR_TYPES.INVESTIGATOR],
            },
            results: [{
                displayVariationId: "DOIGT_INVESTIGATOR",
            }]
        }],
        useActions: []
    },
    "DIGITAL_BOOK_LOCKED": {
        id: "DIGITAL_BOOK_LOCKED",
        name: "Journal numérique du professeur",
        description: "Journal du professeur, cellé par empreinte digitale, seul son doigt pourra l'ouvrir",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/DIGITAL_BOOK.png",
        canBeTaken: true,
        toPrintIrl: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfObjectsId: ["DOIGT"],
            },
            results: [{
                giveItemIds: ["DIGITAL_BOOK"],
            }]
        }]
    },
    "DIGITAL_BOOK": {
        id: "DIGITAL_BOOK",
        name: "Journal numérique du professeur",
        description: `
## dernière entrée du journal : 

Ces satané Illuminati continue de me harceler pour obtenir mes recherches.. 
Je sais qu'ils rodent partout mais je ne me laisserais pas faire !

Jamais il n'obtiendront mes travaux !`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/DIGITAL_BOOK.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "COURSE_LISTE": {
        id: "COURSE_LISTE",
        name: "liste de course",
        description: `Une liste de course étrange : 
- 1 oeuf de dinosaure 
- 1 ambre préhistorique 
- 1 météorite

Un griboulli en bas semble avoir un sens mais vous ne savez pas quoi, il vous manque peut-être un sens de l'investigation...`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/COURSE_LISTE.png",
        canBeTaken: true,
        variations: {
            COURSE_LISTE_INVESTIGATOR: {
                description: `Une liste de course étrange, mais vous vous attardez surtout sur le gribouilli, quil vous parait naturel de déchifrer`,
                useActions: [{
                    conditions: {
                        needsOneOfCharacterType: [CHAR_TYPES.INVESTIGATOR],
                    },
                    results: [{
                        giveItemIds: ["CODE_LOCKER_1"],
                    }]
                }]
            }
        },
        lookActions: [
            {
                conditions: {
                    needsOneOfCharacterType: [CHAR_TYPES.INVESTIGATOR],
                },
                results: [{
                    displayVariationId: "COURSE_LISTE_INVESTIGATOR",
                }]
            }
        ],
        useActions: []
    },
    "CODE_LOCKER_1": {
        id: "CODE_LOCKER_1",
        name: "Code de casier N°1",
        description: `Le code du casier N°1 !`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_CODE_1.png",
        canBeTaken: true,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "LOCKER_1_LOCKED": {
        id: "LOCKER_1_LOCKED",
        name: "Casier N°1",
        description: `Un casier fermé par un code. 
        
Le casier a reçu d'important dégats comme si on avait essayé sauvageent de l'ouvrir`,
        canBeTaken: false,
        toPrintIrl: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfObjectsId: ["CODE_LOCKER_1"],
            },
            results: [{
                replaceByItemId: "LOCKER_1_OPEN",
                giveItemIds: ["EGG"],
            }]
        }]
    }, "LOCKER_1_OPEN": {
        id: "LOCKER_1_OPEN",
        name: "Casier N°1",
        description: `Un casier ouvert, il ne contient plus rien`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_1.png",
        canBeTaken: false,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "LOCKER_2_LOCKED": {
        id: "LOCKER_2",
        name: "Casier N°1",
        description: `Un casier fermé par un code. 
        
Quelque chose semble briller à l'intérieur`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_2.png",
        canBeTaken: false,
        toPrintIrl: true,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfObjectsId: ["LOCKER_CODE_2"],
            },
            results: [{
                replaceByItemId: "LOCKER_2_OPEN",
                giveItemIds: ["EGG"],
            }]
        }]
    }, "LOCKER_2_OPEN": {
        id: "LOCKER_2_OPEN",
        name: "Casier N°2",
        description: `Un casier ouvert, il ne contient plus rien`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_2.png",
        canBeTaken: false,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "LOCKER_3_LOCKED": {
        id: "LOCKER_3_LOCKED",
        name: "Casier N°3",
        description: `Un casier fermé par un code.`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_3.png",
        canBeTaken: false,
        variations: {},
        lookActions: [],
        useActions: [{
            conditions: {
                needsOneOfObjectsId: ["LOCKER_CODE_3"],
            },
            results: [{
                replaceByItemId: "LOCKER_3",
                giveItemIds: ["ADN_MODULE"],
            }]
        }]
    },
    "LOCKER_3": {
        id: "LOCKER_3",
        name: "Casier N°3",
        description: `Un casier ouvvet, vide`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LOCKER_3.png",
        canBeTaken: false,
        variations: {},
        lookActions: [],
        useActions: []
    },
    "LAB_NOTE": {
        id: "LAB_NOTE",
        name: "Note de laboratoire",
        description: `Note de laboratoire du professeur, vous n'y comprenez rien mais un scientifique pourrait peut-être vous aider`,
        imageUrl: "https://sharing.hosh.it/images/murd_vat/LAB_NOTE.png",
        canBeTaken: true,
        variations: {
            "LAB_NOTE_SCIENTIFIC": {
                description: `
## Jour 57 

J'ai trouvé que ma machien peut autant provoquer la fin du monde que nous octroyer des ressources infinies.

Je dois faire attention à qui j'en parle, je ne sais pas qui est Illuminati et qui ne l'est pas.

## Jour 58

Il me suffit de désactiver la machine parès chaque utilisation pour que personne ne puisse l'utiliser à mauvais escient.
Je vais tenter une avancé préhistorique très bientot.

J'ai hate ! 
`}
        },
        lookActions: [
            {
                conditions: {
                    needsOneOfCharacterType: [CHAR_TYPES.SCIENTIFIC],
                },
                results: [{
                    displayVariationId: "LAB_NOTE_SCIENTIFIC",
                }]
            }
        ],
        useActions: []
    }
}


