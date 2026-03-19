const canvas = document.getElementById('flowCanvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        function resize() { width = canvas.width = canvas.offsetWidth; height = canvas.height = canvas.offsetHeight; }
        window.onresize = resize; resize();

        let items = []; let totalCount = 0; let volSum = 0; const laserX = 400;

        function spawnItem() {
            items.push({
                x: width + 50, y: height/2 + (Math.random()*40 - 20),
                w: 40 + Math.random()*60, h: 30 + Math.random()*40,
                speed: 7 + Math.random()*3, scanned: false, sku: 'SKU-' + Math.floor(Math.random()*900 + 100)
            });
        }

        function drawLaser(x) {
            const g = ctx.createLinearGradient(x-30, 0, x+30, 0);
            g.addColorStop(0, 'transparent'); g.addColorStop(0.5, 'rgba(0, 95, 184, 0.1)'); g.addColorStop(1, 'transparent');
            ctx.fillStyle = g; ctx.fillRect(x-30, 0, 60, height);
            ctx.strokeStyle = 'rgba(0, 95, 184, 0.4)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }

        function updateTelemetry(item) {
            totalCount++; const v = (item.w * item.h * 40) / 1000000; volSum += v;
            document.getElementById('curSKU').innerText = item.sku;
            document.getElementById('totalItems').innerText = totalCount;
            document.getElementById('totalVol').innerText = volSum.toFixed(3);
            document.getElementById('avgW').innerText = item.w.toFixed(1);
            document.getElementById('avgH').innerText = item.h.toFixed(1);
            document.getElementById('pps-counter').innerText = `PPS: 1.8`;

            const stream = document.getElementById('eventStream');
            const entry = document.createElement('div'); entry.className = 'log-entry highlight';
            entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${item.sku} OK`;
            stream.prepend(entry); if(stream.children.length > 10) stream.lastChild.remove();
        }

        function animate() {
            ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 0, width, height);
            drawLaser(laserX);
            items.forEach((item) => {
                item.x -= item.speed; const dist = Math.abs(item.x - laserX);
                if(dist < 180) {
                    ctx.fillStyle = dist < 10 ? '#005fb8' : 'rgba(0, 95, 184, 0.2)';
                    const progress = 1 - (dist / 180); ctx.globalAlpha = progress;
                    ctx.fillRect(item.x - item.w/2, item.y - item.h/2, item.w, item.h);
                    ctx.globalAlpha = 1;
                    if(dist < 5 && !item.scanned) { item.scanned = true; updateTelemetry(item); }
                }
            });
            items = items.filter(i => i.x > -100); requestAnimationFrame(animate);
        }
        setInterval(spawnItem, 1000); animate();