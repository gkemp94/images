const { ExifImage } = require('exif');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const { get } = require('lodash');

const getExif = (image) => {
  return new Promise((res, rej) => {
    new ExifImage({ image }, (err, data) => {
      if (err) {
        res(fs.statSync(image));
      }
      
      res(data);
    });
  });
};

const IMAGE_EXTS = ['JPG', 'jpg', 'gif', 'png', 'PNG', 'jpeg', 'jpg', 'bmp', 'BMP', 'JPEG'];
const IGNORE_PATH = ['ithmb', 'db', 'isi', 'lnk', 'ini', 'dbx', 'wim', 'htm', 'ico', 'exe', 'log', 'dat', 'DAT', 'EXE', 'TMP']
const getFiles = (exts) => {
  return new Promise((res, rej) => {
    glob(`/Volumes/Western Digital/{pictures,pictures2}/**/**.${ ext ? `{${exts.join(',')}}` : '**' }`, (err, files) => {
      if (err) rej(err);
      res(files);
    });
  })
}

const getDate = (exif) => {
  if (get(exif, 'mtime')) {
    new Date()
    const [date] = `${get(exif, 'mtime').toISOString()}`.split('T');
    return date.split('-');
  } else if (get(exif, 'exif.DateTimeOriginal')) {
    const [date] = get(exif, 'exif.DateTimeOriginal').split(' ');
    return date.split(':');
  } else if (get(exif, 'exif.CreateDate' )) {
    const [date] = get(exif, 'exif.DateTimeOriginal').split(' ');
    return date.split(':');
  } else {
    console.log(exif);
    return [0000, 00, 00];
  }
}

(async () => {
  // Move Unknown Files to Unknown Folder
  const files = await getFiles();
  files.forEach(x => {
    let split = x.split('.');
    if ([...IMAGE_EXTS, ...IGNORE_PATH].includes(split[split.length - 1])) {
      return;
    } else {
      const newPath = x
        .replace(`/Volumes/Western Digital/pictures2/`, '/Volumes/Western Digital/unknown/')
        .replace(`/Volumes/Western Digital/pictures/`, '/Volumes/Western Digital/unknown/');
      console.log(`${x} -> ${newPath}`);
      // fs.moveSync(x, newPath);
    }
  });

  // Get Images FIles
  const imgFiles = await getFiles(IMAGE_EXTS);


  console.log(`Processing ${imgFiles.length} files.`);
  for (let i = 0; i < imgFiles.length; i++) {
    const exif = await getExif(imgFiles[i]);
    const [year, month, day] = getDate(exif);
    !(i % 100) && console.log(`${i + 1}/${imgFiles.length}`);
    const file = files[i].split('/').split();
    fs.moveSync(files[i], '/Volumes/Western Digitial/sorted/${year}/${month}/${year}')
  }
})();

// TODO: Remove Clean Directory
