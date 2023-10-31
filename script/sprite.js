class Spritesheet {
    constructor (src, numRows = 1, numCols = 1, onload = ()=>{}) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.sprites = [];
        this.sheet = new Image();
        this.sheet.src = src;
        this.loaded = false;

        const self = this;
        this.sheet.onload = () => {
            const spriteW = self.sheet.width / self.numCols;
            const spriteH = self.sheet.height / self.numRows;
            const sWidth = Math.round(spriteW);
            const sHeight = Math.round(spriteH);
            const dWidth = Math.ceil(spriteW);
            const dHeight = Math.ceil(spriteH);
            // reuse temp canvas to extract images
            let cv = document.createElement('canvas');
            let ctx = cv.getContext('2d');
            cv.width = Math.ceil(spriteW);
            cv.height = Math.ceil(spriteH);
            // save blobs linearly
            let numLoaded = 0;
            for (let r = 0; r < numRows; r++) {
                for (let c = 0; c < numCols; c++) {
                    const sx = c*sWidth;
                    const sy = r*sHeight;
                    ctx.clearRect(0,0, dWidth,dHeight);
                    ctx.drawImage(self.sheet, sx,sy, sWidth,sHeight, 0,0, dWidth,dHeight);
                    cv.toBlob(blob => {
                        const newImg = document.createElement("img");
                        const url = URL.createObjectURL(blob);
                        newImg.onload = () => URL.revokeObjectURL(url);
                        newImg.src = url;
                        self.sprites.push(newImg); //// does this make load order unstable?
                        // document.body.appendChild(newImg);
                        numLoaded++;
                        if (numLoaded == numRows*numCols) {
                            self.loaded = true;
                            onload();
                        }
                    });
                }
            }
        }
    }

    get numSprites () { return this.sprites.length; }

    getSprite (a,b) {
        const id = (b == undefined) ? a : (a*this.numCols + b);
        const oob = (b == undefined)
            ? ((a < 0) || (a > this.numRows*this.numCols))
            : ((a < 0) || (a > this.numCols) || (b < 0) || (b > this.numRows));
        // console.log(id);
        if (oob) {
            console.error('attempted to access sprite outside bounds of spritesheet');
        } else {
            return this.sprites[id];
        }
    }
}

/////////////////////////////////

//// example usage ////

// const t0 = Date.now();

// let runeset = new Spritesheet(
//     'source/runeset-00-blue.png',
//     12, 12,
//     () => {
//         console.log('spritesheet loaded in ' + (Date.now()-t0) + 'ms');

//         for (let i = 0; i < runeset.numSprites; i++) {
//             document.body.appendChild(runeset.getSprite(i));
//         }

//         document.body.appendChild(document.createElement('br'));
//         document.body.appendChild(document.createElement('br'));

//         let test0 = new Image();
//         test0.src = runeset.getSprite(12).src;
//         test0.onload = () => document.body.appendChild(test0);

//         let test1 = new Image();
//         test1.src = runeset.getSprite(2,4).src;
//         test1.onload = () => document.body.appendChild(test1);
//     }
// );