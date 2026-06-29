const fs = require('fs');
const path = require('path');
const https = require('https');

const destPath = path.join(__dirname, '../public/models/hand_landmarker.task');

// 使用国内极少被墙的 gitee 或其他稳定镜像
// 这是一个存放了 hand_landmarker.task 的已知可用仓库
const urls = [
  'https://gitee.com/yidao620c/mediapipe-models/raw/master/hand_landmarker/hand_landmarker.task',
  'https://cdn.jsdelivr.net/gh/google/mediapipe@v0.10.0/mediapipe/tasks/testdata/vision/hand_landmarker.task',
  'https://raw.gitmirror.com/google/mediapipe/master/mediapipe/tasks/testdata/vision/hand_landmarker.task'
];

async function downloadFromUrls(urlList, dest) {
  for (const url of urlList) {
    try {
      console.log(`Trying to download from: ${url}`);
      await downloadFile(url, dest);
      console.log('✅ Successfully downloaded model to local disk!');
      return;
    } catch (err) {
      console.error(`❌ Failed from ${url}: ${err.message}`);
    }
  }
  console.error('All mirror sources failed. Please download the model manually from https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task and place it in public/models/');
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    const request = https.get(url, (response) => {
      // Handle Redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Status Code: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        
        // 校验文件大小 (该模型一般 > 10MB)
        const stats = fs.statSync(dest);
        if (stats.size < 1000000) {
           fs.unlinkSync(dest);
           reject(new Error('Downloaded file is too small, likely an error page.'));
           return;
        }
        
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
    
    // Timeout handle
    request.setTimeout(15000, () => {
        request.abort();
        reject(new Error('Connection timed out'));
    });
  });
}

// 确保目录存在
const dir = path.dirname(destPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

downloadFromUrls(urls, destPath);
