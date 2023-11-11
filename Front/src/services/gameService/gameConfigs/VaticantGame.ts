export const CHAR_TYPES = {
    "LAWFUL": "LAWFUL",
    "BAD": "BAD",
    "NORMAL": "NORMAL",
    "TECH": "TECH",
    "INVESTIGATOR": "INVESTIGATOR",
    "SCIENTIFIC": "SCIENTIFIC",
}

export const TROMBINOSCOPE: Trombinoscope = {
    "1_ESCALADE": {
        "id": "1_ESCALADE",
        "name": "Marc Lavoie",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes un grimpeur aveugle à la suite d'une expérience raté avec le scientifique.

Avec une accuité auditive hors du commun, vous avez développé une **technique de grimpe unique**. **Vous resenter plus de choses que la moyenne avec vos mains**. 

Vous étiez un bon ami du scientifique`,
            private: "Vous recherchez la vérité sur les travaux du scientifique et chercher du sens à vos super sens"
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.LAWFUL]
    },
    "2_CRYPTO": {
        "id": "2_CRYPTO",
        "name": "Alex Myster",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Célèbre Expert en cryptographie et compréhension de donnée numérique.
            
Collègue distant du scientifique, vous avez toujours été en compétition avec lui, mais sa mort vous creuse un vide.`,
            private: "Vous chercher à comprendre la mort du scientifique qui vous peine et peut-être reprendre ses travaux"
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.LAWFUL, CHAR_TYPES.TECH]
    },
    "3_PHYS": {
        "id": "3_PHYS",
        "name": "Mme Pigius Glouton",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes une physicienne de renomée mondiale, mais plus pour votre passion dévorante pour les pigeon que vos travaux. 
            
Vous avez collaboré avec le scientifique pendant plusieurs années avant de vous consacrer pleinement à votre passion pour les pigeons. Vous avez très faim.

Vous avez une connaissance approfondie des travaux du scientifique et de ses recherches.`,
            private: `Vous saviez que le scientifique travailait sur le voyage temporel. Mais trop de **gens malveillant** s'intéressait à ses travaux et vous **gardez donc cet aspect de sa recherche secret** autant que possible. 

VOus voulez trouver ce qui s'est passé et protéger ses travaux.`
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.LAWFUL, CHAR_TYPES.SCIENTIFIC]
    },
    "4_DETECTIVE": {
        "id": "4_DETECTIVE",
        "name": "Richard Money",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vraisemblablement la seule personne autorisée à entrer dans le laboratoire du scientifique. Vous êtes un détective privé de renomée mondiale.

Votre oeil afuté et votre esprit de déduction vous permettent de voir des choses que personne ne voit.            

Vous portez une arme (demander au MJ)`,
            private: `Vous avez été contacté par le scientifique avant sa mort pour enquêter sur des menaces qui pesaient sur lui. 
            
Arrivé trop tard, vous êtes déterminé à trouver le coupable.`
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.LAWFUL, CHAR_TYPES.INVESTIGATOR]
    },
    "5_DET_ASSISTANT": {
        "id": "5_DET_ASSISTANT",
        "name": "Remi·e Chevalier",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes l'assistant.e du Détective Richard Money. Vous avez des compétences en investigation. 

Votre oeil afuté et votre esprit de déduction vous permettent de voir des choses que personne ne voit. 

Vous portez une arme (demander au MJ)`,
            private: `Vous êtes un·e Illuminati. Le grand conseil vous avait dit que les travaux du scientifique doievnt à tout finir entre les main de clan. 

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui.

Vous suivez le détective pour vous **rapprocher le plus possible des travaux du scientifique**. Mais vous êtes bien déterminé à faire le nécessaire pour en **emparer le moment venu**. 


Vous couchez avec \`Sophie Latech\`, la femme de Mr Bitanmin Sponsor du scientifique, Vous vous dites tout ensemble et **vous vous aidez mutuellement**.`
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.BAD, CHAR_TYPES.INVESTIGATOR],
    },
    "6_SPONSOR": {
        "id": "6_SPONSOR",
        "name": "Henry Bitanmin",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes le sponsor du scientifique. Vous avez investi des millions dans ses recherches et vous êtes le seul à avoir accès à certain de ses travaux sans les comprendre.`,
            private: `Vous êtes un Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**, c'est pour ça qu'il vous finance vous-même. 
            
Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui.
Vous êtes marié à \`Sophie Latech\` mais le mariage bat de l'aile. Elle a préféré garder son nom pour des raisons compréhensibles.`
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.BAD],
    },
    "7_TECHGIRL": {
        "id": "7_TECHGIRL",
        "name": "Sophie Latech",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes la femme de \`Mr Bitanmin\`, le sponsor du scientifique. Vous êtes une experte en informatique et en technologie.`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**, c'est pour ça qu'il vous finance vous-même.

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui.

Vous êtes marié à \`Mr Bitanmin\` mais le mariage bat de l'aile. Vous détestez son nom par exemple. 

C'est pour ça que vous le trompez avec \`Remi Chevalier\` l'assistant du détective. Vous vous dites tout ensemble et **vous vous aidez mutuellement**.`
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.BAD, CHAR_TYPES.TECH],
    },
    "8_PNJ_1": {
        "id": "8_PNJ_1",
        "name": "Jean Valmont",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes un passant déterminé qui a réussi à rentrer dans ce labo pendant la confusion. Le truc bizarre c'est que vous êtes déguisé en Radar (???)
Vous êtes un peu perdu mais vous avez l'air de savoir ce que vous faites.`,
            private: `Vous êtes un ancien Illuminati. Le clan voulait que le scientifique finisse ses travaux.
            
Vous savez que le conseil a envoyé d'autres agents dans la pièce, mais ne pouvez pas le révéler de peur de vous faire descendre. Vous savez que \`Remi Chevalier\` et \`Henry Bitanmin\` sont des agents du clan, mais qui d'autre ...

Vous avez été banni du clan pour avoir révélé des secrets. Vous êtes déterminé à vous venger en les empechant de parvenir à leurs fins et en aidant les gentils`
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.LAWFUL],
    },
    "9_PNJ_2": {
        "id": "8_PNJ_2",
        "name": "Victor Marceau",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes un passant déterminé qui a réussi à rentrer dans ce labo pendant la confusion. Vous êtes un peu perdu mais vous avez l'air de savoir ce que vous faites.`,
            private: `Vous êtes un ancien Illuminati. Le clan voulait que le scientifique finisse ses travaux.

Vous savez que le conseil a envoyé d'autres agents dans la pièce, mais ne pouvez pas le révéler de peur de vous faire descendre. Vous savez que \`Remi Chevalier\` et \`Anne Leroy\` sont des agents du clan, mais qui d'autre ...

Vous avez été banni du clan pour avoir révélé des secrets. Vous êtes déterminé à vous venger en les empechant de parvenir à leurs fins et en aidant les gentils`,
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.LAWFUL],
    },
    "10_PNJ_3": {
        "id": "10_PNJ_3",
        "name": "Dr Elisa Corbin",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes une scientifique experte en biologie. Vous êtes là parce que vous aimez le drama, qu'est-ce que vous foutez là ?`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**.

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui. Vous ne faites pas confiance à \`Jean Valmont\` ni \`Victor Marceau\` car ils ont trahi le clan.

Mais vous ne pouvez pas le révéler de peur de vous faire descendre.`,
        },
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.BAD],
    },
    "11_PNJ_4": {
        "id": "11_PNJ_4",
        "name": "Mme Clara Morille",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
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
        "types": [CHAR_TYPES.NORMAL, CHAR_TYPES.BAD],
    },
    "12_PNJ_5": {
        "id": "12_PNJ_5",
        "name": "Anne Leroy",
        imageUrl: "https://sharing.hosh.it/images/murd_vat/unknown.png",
        "scenario": {
            public: `Vous êtes la femme du Détective \`Richard Money\`, vous êtes là car vous vouliez voir à quoi ressemblait son travail.`,
            private: `Vous êtes une Illuminati. Le grand conseil vous avait dit que **les travaux du scientifique doivent à tout prix finir entre les mains du clan**

Vous savez que le conseil a envoyé d'autres agents dans la pièce mais ne savez pas qui. Vous ne faites pas confiance à \`Jean Valmont\` ni \`Victor Marceau\` car ils ont trahi le clan.

Vous êtes là pour faire mine de faire avancer l'enquête mais tentez juste d'empecher votre mari et les non-illuminati de découvrir la vérité sur le travaux du scientifique.
`},
        types: [CHAR_TYPES.NORMAL, CHAR_TYPES.BAD],
    },
}

export const GAME_NAME = "La mort du mysterieux Dr Vaticant"
export const GAME_DESCRIPTION = `Vous vous retrouvez réuni·e·s dans le laboratoire du scientifique \`Dr Vaticant\` dont vous n'avez jamais bien compris le travail. 

Sa mort a été déclarée mais aucun supect n'est encore connu. Tout le monde accours pour y voir plus clair, seules les personnes présente dans la pièce ont pu se procurer un accès.

**Suivez les indices, utilisez votre esprit de déduction pour découvrir comment le scientifique est mort et peut-être enfin comprendre l'ampleur de son travail !**

PS : Des armes sont présentes dans le jeu et peuvent être utilisées pour assomer d'autres joueur·se·s. Un·e Joueur·se assomé doit se laisser prendre ses objets et faire le mort pendant 1 minute. Iel peut ensuite se relever et continuer à jouer avec pleine connaissance de ce qui vient de se passer.
`


export const FULL_INVENTORY: Inventory = {
}

