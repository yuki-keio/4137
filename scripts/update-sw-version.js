#!/usr/bin/env node

/**
 * Service Workerのキャッシュバージョンを自動更新するスクリプト
 * ビルド時にタイムスタンプを使用してバージョンを更新します
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swPath = path.join(__dirname, '../public/sw.js');

// タイムスタンプベースのバージョンを生成 (YYYY.MM.DD.HHmm 形式)
const now = new Date();
const version = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

try {
    let swContent = fs.readFileSync(swPath, 'utf8');

    // CACHE_NAMEの行を更新
    const cacheNameRegex = /const CACHE_NAME = '4137-game-v[\d.]+';/;
    const newCacheName = `const CACHE_NAME = '4137-game-v${version}';`;

    if (cacheNameRegex.test(swContent)) {
        swContent = swContent.replace(cacheNameRegex, newCacheName);
        fs.writeFileSync(swPath, swContent, 'utf8');
        console.log(`✅ Service Worker version updated to: 4137-game-v${version}`);
    } else {
        console.error('❌ Could not find CACHE_NAME in sw.js');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error updating sw.js:', error.message);
    process.exit(1);
}
