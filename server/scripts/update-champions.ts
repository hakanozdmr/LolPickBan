import fs from 'fs';
import path from 'path';

interface RiotChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface ChampionData {
  data: Record<string, RiotChampion>;
  version: string;
}

interface Champion {
  id: string;
  name: string;
  title: string;
  roles: string[];
  classes: string[];
  image: string;
}

const ROLE_MAPPING: Record<string, string> = {
  'Assassin': 'Mid',
  'Fighter': 'Top',
  'Mage': 'Mid', 
  'Marksman': 'ADC',
  'Support': 'Support',
  'Tank': 'Top',
};

// Some champions have specific roles that override the class mapping
const SPECIFIC_ROLES: Record<string, string[]> = {
  'Graves': ['Jungle'],
  'Kindred': ['Jungle'],
  'KhaZix': ['Jungle'],
  'LeeSin': ['Jungle'],
  'Elise': ['Jungle'],
  'Sejuani': ['Jungle'],
  'Zac': ['Jungle'],
  'Hecarim': ['Jungle'],
  'Kayn': ['Jungle'],
  'Evelynn': ['Jungle'],
  'Nidalee': ['Jungle'],
  'Shaco': ['Jungle'],
  'Rengar': ['Jungle'],
  'Nocturne': ['Jungle'],
  'Rammus': ['Jungle'],
  'Ammu': ['Jungle'],
  'Shyvana': ['Jungle'],
  'Udyr': ['Jungle'],
  'Warwick': ['Jungle'],
  'Volibear': ['Jungle'],
  'Nunu': ['Jungle'],
  'Ivern': ['Jungle'],
  'Lillia': ['Jungle'],
  'Viego': ['Jungle'],
  'Gwen': ['Top'],
  'Akshan': ['ADC'],
  'Vex': ['Mid'],
  'Zeri': ['ADC'],
  'Renata': ['Support'],
  'Belveth': ['Jungle'],
  'Nilah': ['ADC'],
  'KSante': ['Top'],
  'Naafiri': ['Mid'],
  'Briar': ['Jungle'],
  'Smolder': ['ADC'],
  'Aurora': ['Mid'],
  'Ambessa': ['Top'],
};

const MULTI_ROLE_CHAMPIONS: Record<string, string[]> = {
  'Yasuo': ['Mid', 'Top'],
  'Lux': ['Mid', 'Support'],
  'Brand': ['Mid', 'Support'], 
  'Velkoz': ['Mid', 'Support'],
  'Xerath': ['Mid', 'Support'],
  'Zyra': ['Mid', 'Support'],
  'Morgana': ['Mid', 'Support'],
  'Karma': ['Mid', 'Support'],
  'Leblanc': ['Mid'],
  'Swain': ['Mid', 'Support'],
  'Galio': ['Mid', 'Support'],
  'Pantheon': ['Mid', 'Top', 'Support'],
  'Pyke': ['Support'],
  'Senna': ['ADC', 'Support'],
  'Seraphine': ['Mid', 'Support'],
  'Yone': ['Mid', 'Top'],
  'Garen': ['Top'],
  'Darius': ['Top'],
  'Riven': ['Top'],
  'Fiora': ['Top'],
  'Camille': ['Top'],
  'Irelia': ['Mid', 'Top'],
  'Akali': ['Mid', 'Top'],
  'Katarina': ['Mid'],
  'Zed': ['Mid'],
  'Talon': ['Mid'],
  'Qiyana': ['Mid'],
  'Sylas': ['Mid'],
  'Ekko': ['Mid', 'Jungle'],
  'Fizz': ['Mid'],
  'Kassadin': ['Mid'],
  'Diana': ['Mid', 'Jungle'],
  'Vayne': ['ADC'],
  'Jinx': ['ADC'],
  'Caitlyn': ['ADC'],
  'Ashe': ['ADC'],
  'MissFortune': ['ADC'],
  'Draven': ['ADC'],
  'Lucian': ['ADC'],
  'Ezreal': ['ADC'],
  'Tristana': ['ADC'],
  'Kalista': ['ADC'],
  'KogMaw': ['ADC'],
  'Varus': ['ADC'],
  'Sivir': ['ADC'],
  'Twitch': ['ADC'],
  'Alistar': ['Support'],
  'Thresh': ['Support'],
  'Blitzcrank': ['Support'],
  'Leona': ['Support'],
  'Braum': ['Support'],
  'Tahm': ['Support'],
  'Janna': ['Support'],
  'Soraka': ['Support'],
  'Sona': ['Support'],
  'Nami': ['Support'],
  'Lulu': ['Support'],
  'Yuumi': ['Support'],
};

async function fetchChampions(): Promise<Champion[]> {
  try {
    console.log('Fetching latest version...');
    const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsResponse.json();
    const latestVersion = versions[0];
    
    console.log(`Fetching champions data for version ${latestVersion}...`);
    const championsResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const championsData: ChampionData = await championsResponse.json();
    
    const champions: Champion[] = [];
    
    for (const [championKey, riotChampion] of Object.entries(championsData.data)) {
      const championId = riotChampion.id;
      
      // Determine roles
      let roles: string[] = [];
      if (SPECIFIC_ROLES[championId]) {
        roles = SPECIFIC_ROLES[championId];
      } else if (MULTI_ROLE_CHAMPIONS[championId]) {
        roles = MULTI_ROLE_CHAMPIONS[championId];
      } else {
        // Map from tags/classes to roles
        roles = riotChampion.tags.map(tag => ROLE_MAPPING[tag] || 'Mid').filter((role, index, arr) => arr.indexOf(role) === index);
        if (roles.length === 0) roles = ['Mid']; // Default fallback
      }
      
      const champion: Champion = {
        id: championId.toLowerCase().replace(/[^a-z0-9]/g, ''), // Clean ID for consistency
        name: riotChampion.name,
        title: riotChampion.title,
        roles: roles,
        classes: riotChampion.tags, // Use original tags as classes
        image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${riotChampion.image.full}`,
      };
      
      champions.push(champion);
    }
    
    console.log(`Successfully processed ${champions.length} champions`);
    return champions;
    
  } catch (error) {
    console.error('Error fetching champions:', error);
    throw error;
  }
}

async function updateChampionsFile() {
  try {
    const champions = await fetchChampions();
    
    // Sort champions alphabetically by name
    champions.sort((a, b) => a.name.localeCompare(b.name));
    
    const outputPath = './server/data/champions.json';
    await fs.promises.writeFile(outputPath, JSON.stringify(champions, null, 2));
    
    console.log(`✅ Successfully updated champions.json with ${champions.length} champions`);
    console.log(`📁 File saved to: ${outputPath}`);
    
    // Log some sample champions for verification
    console.log('\n📋 Sample champions:');
    champions.slice(0, 5).forEach(champ => {
      console.log(`  ${champ.name} (${champ.title}) - Roles: ${champ.roles.join(', ')} - Classes: ${champ.classes.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to update champions:', error);
    process.exit(1);
  }
}

// Run the update
if (import.meta.url.endsWith(process.argv[1])) {
  updateChampionsFile();
}

export { updateChampionsFile, fetchChampions };