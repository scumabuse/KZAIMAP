import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(full);
  }
  return results;
}

const files = walk('./src');
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;

  // Fix 1: Remove unused imports from specific pages
  content = content
    // MapPage - remove AnimatePresence 
    .replace(/import \{ motion, AnimatePresence \} from 'framer-motion';\n(.*?MapPage)/s, (m, rest) => {
      return `import { motion } from 'framer-motion';\n${rest}`;
    })
    // AdminPage - remove AnimatePresence
    .replace(/^(import \{ )AnimatePresence, (motion[^}]*\} from 'framer-motion';)/m, '$1$2')
    // HomePage - remove useScroll, useTransform
    .replace("import { motion, useScroll, useTransform } from 'framer-motion';", "import { motion } from 'framer-motion';")
    // ForecastPage - remove TrendingUp, Zap
    .replace("import { TrendingUp, Brain, AlertTriangle, Calculator, Zap, BarChart3 } from 'lucide-react';",
             "import { Brain, AlertTriangle, Calculator, BarChart3 } from 'lucide-react';");

  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log('Fixed imports in:', path.relative('.', file));
    totalFixed++;
  }
}

// Now fix the Variants issue in HomePage by replacing the variant objects
const homeFile = './src/pages/HomePage.tsx';
let home = fs.readFileSync(homeFile, 'utf8');

// Replace the fadeUp variant to not include ease in the variant
home = home.replace(
  `const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};`,
  `const fadeUp: import('framer-motion').Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};`
);

// Fix containerVariants
home = home.replace(
  `const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};`,
  `const containerVariants: import('framer-motion').Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};`
);

fs.writeFileSync(homeFile, home);
console.log('Fixed Variants types in HomePage');

// Fix StatCard variants
const statFile = './src/components/stats/StatCard.tsx';
let stat = fs.readFileSync(statFile, 'utf8');
stat = stat.replace(
  `  const cardVariants = {
    hidden:  { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { delay: index * 0.08, duration: 0.5, ease: "easeOut" }
    },
  };`,
  `  const cardVariants: import('framer-motion').Variants = {
    hidden:  { opacity: 0, y: 30, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { delay: index * 0.08, duration: 0.5 }
    },
  };`
);
fs.writeFileSync(statFile, stat);
console.log('Fixed StatCard variants');

// Fix Sidebar itemVariants
const sidebarFile = './src/components/layout/Sidebar.tsx';
let sidebar = fs.readFileSync(sidebarFile, 'utf8');
sidebar = sidebar.replace(
  `const itemVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.05 * i, duration: 0.35, ease: "easeOut" },
  }),
};`,
  `const itemVariants: import('framer-motion').Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.05 * i, duration: 0.35 },
  }),
};`
);
fs.writeFileSync(sidebarFile, sidebar);
console.log('Fixed Sidebar variants');

// Fix AddReportPage sectionVariants
const addFile = './src/pages/AddReportPage.tsx';
let add = fs.readFileSync(addFile, 'utf8');
add = add.replace(
  `const sectionVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  }),
};`,
  `const sectionVariants: import('framer-motion').Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  }),
};`
);
fs.writeFileSync(addFile, add);
console.log('Fixed AddReportPage variants');

// Remove AnimatePresence from AdminPage import
const adminFile = './src/pages/AdminPage.tsx';
let admin = fs.readFileSync(adminFile, 'utf8');
admin = admin.replace(
  "import { motion, AnimatePresence } from 'framer-motion';",
  "import { motion } from 'framer-motion';"
);
fs.writeFileSync(adminFile, admin);
console.log('Fixed AdminPage imports');

// Remove AnimatePresence from MapPage import
const mapFile = './src/pages/MapPage.tsx';
let mapP = fs.readFileSync(mapFile, 'utf8');
mapP = mapP.replace(
  "import { motion, AnimatePresence } from 'framer-motion';",
  "import { motion } from 'framer-motion';"
);
fs.writeFileSync(mapFile, mapP);
console.log('Fixed MapPage imports');

// Fix ForecastPage unused imports
const fcastFile = './src/pages/ForecastPage.tsx';
let fcast = fs.readFileSync(fcastFile, 'utf8');
fcast = fcast.replace(
  "import { TrendingUp, Brain, AlertTriangle, Calculator, Zap, BarChart3 } from 'lucide-react';",
  "import { Brain, AlertTriangle, Calculator, BarChart3 } from 'lucide-react';"
);
fs.writeFileSync(fcastFile, fcast);
console.log('Fixed ForecastPage imports');

// Fix HomePage unused imports
const homeFilePath = './src/pages/HomePage.tsx';
let homePage = fs.readFileSync(homeFilePath, 'utf8');
homePage = homePage.replace(
  "import { motion, useScroll, useTransform } from 'framer-motion';",
  "import { motion } from 'framer-motion';"
);
fs.writeFileSync(homeFilePath, homePage);
console.log('Fixed HomePage imports');

console.log('\nAll done!');
