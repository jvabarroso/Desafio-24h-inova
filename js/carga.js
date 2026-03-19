const canvas = document.getElementById('cargoCanvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        function resize() { width = canvas.width = canvas.offsetWidth; height = canvas.height = canvas.offsetHeight; }
        window.onresize = resize; resize();

        const truckSilhueta = { x: width/2 - 250, y: height/2 - 80, w: 500, h: 160 };
        const mixSKUs = [{ c: '#005fb8', w: 20, h: 20 }, { c: '#4a5568', w: 40, h: 25 }, { c: '#cbd5e0', w: 60, h: 40 }];
        let currentEff = 0; let iteration = 0; const targetEff = 92.4; const startTime = Date.now();

        function drawTruckSilhueta() {
            ctx.strokeStyle = '#d9e2eb'; ctx.lineWidth = 3;
            ctx.strokeRect(truckSilhueta.x, truckSilhueta.y, truckSilhueta.w, truckSilhueta.h);
        }

        function runPackingIteration() {
            if(currentEff >= targetEff) { finalizeAlgorithm(); return; }
            ctx.fillStyle = '#f8f9fa'; ctx.fillRect(truckSilhueta.x+2, truckSilhueta.y+2, truckSilhueta.w-4, truckSilhueta.h-4);
            iteration++; document.getElementById('iter-counter').innerText = `ITER: ${iteration}`;
            const terminal = document.getElementById('algoTerminal');
            const entry = document.createElement('div');
            if(Math.random() < 0.35) {
                currentEff = Math.min(targetEff, currentEff + Math.random()*15);
                entry.className = 'algo-entry fit'; entry.innerHTML = `> OPT_FOUND: ${currentEff.toFixed(1)}%`;
                drawPackingCombination(true);
            } else {
                entry.className = 'algo-entry'; entry.innerHTML = `[PROC] ANALYZING #${iteration}... OK`;
                drawPackingCombination(false);
            }
            terminal.prepend(entry); if(terminal.children.length > 15) terminal.lastChild.remove();
            setTimeout(runPackingIteration, 60);
        }

        function drawPackingCombination(isBest) {
            const rows = 6; const cols = 15; const cardW = truckSilhueta.w / cols; const cardH = truckSilhueta.h / rows;
            for(let r=0; r<rows; r++) {
                for(let c=0; c<cols; c++) {
                    if(Math.random() * 100 < currentEff + (isBest ? 10 : -10)) {
                        const sku = mixSKUs[Math.floor(Math.random()*3)];
                        ctx.fillStyle = isBest ? sku.c : '#e2e8f0';
                        ctx.fillRect(truckSilhueta.x + c*cardW + 2, truckSilhueta.y + r*cardH + 2, cardW - 4, cardH - 4);
                    }
                }
            }
        }

        function finalizeAlgorithm() {
            document.getElementById('finalEff').innerText = targetEff.toFixed(1);
            document.getElementById('finalWeight').innerText = 12450;
            document.getElementById('finalItems').innerText = 442;
            document.getElementById('calcTime').innerText = ((Date.now() - startTime)/1000).toFixed(2);
        }
        setTimeout(runPackingIteration, 1000); drawTruckSilhueta();