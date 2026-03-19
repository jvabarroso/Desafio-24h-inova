setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);

        const canvas = document.getElementById('kineticCanvas');
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }
        window.onresize = resize;
        resize();

        let truckState = { roll: 0, danger: false };

        function drawSimulation() {
            ctx.fillStyle = '#f8f9fa'; // Fundo claro empresarial
            ctx.fillRect(0, 0, width, height);

            // Grade da estrada
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            for(let i=0; i<width; i+=50) {
                ctx.beginPath();
                ctx.moveTo(width/2, height/2);
                ctx.lineTo(i, height);
                ctx.stroke();
            }

            ctx.save();
            ctx.translate(width / 2, height / 2 + 50);

            // Inclinação (Roll) com multiplicador para visibilidade
            const targetRoll = truckState.roll * (Math.PI / 180) * 1.5;
            ctx.rotate(targetRoll);

            // --- DESENHO DO CAMINHÃO ---
            // Baú Principal
            ctx.fillStyle = '#001529';
            ctx.strokeStyle = truckState.danger ? '#c0392b' : '#005fb8';
            ctx.lineWidth = 3;
            ctx.fillRect(-90, -180, 180, 200);
            ctx.strokeRect(-90, -180, 180, 200);

            // Cabine (Frente)
            ctx.fillStyle = '#102a43';
            ctx.fillRect(-80, -210, 160, 30);
            ctx.strokeRect(-80, -210, 160, 30);

            // Detalhes da porta traseira
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath(); ctx.moveTo(0, -180); ctx.lineTo(0, 20); ctx.stroke();

            // Luzes de freio
            ctx.fillStyle = truckState.danger ? '#ff4d4f' : '#3d0000';
            ctx.fillRect(-80, -10, 30, 10);
            ctx.fillRect(50, -10, 30, 10);

            // --- SIMULAÇÃO VISUAL DOS AIRBAGS (COMPENSAÇÃO) ---
            function drawAirbag(x, isActive) {
                ctx.fillStyle = isActive ? (truckState.danger ? '#ff4d4f' : '#40a9ff') : '#d1d9e0';
                ctx.beginPath();
                ctx.arc(x, 40, isActive ? 12 : 8, 0, Math.PI * 2);
                ctx.fill();
                // Brilho do airbag ativo
                if(isActive) {
                    ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
                    ctx.stroke(); ctx.shadowBlur = 0;
                }
            }
            // Airbag Esquerdo infla quando inclina para a Direita (e vice-versa) para compensar
            drawAirbag(-60, truckState.roll < -0.5); 
            drawAirbag(60, truckState.roll > 0.5); 

            ctx.restore();
            requestAnimationFrame(drawSimulation);
        }

        const config = {
            nominal_psi: 48.2,
            events: [
                { desc: "TRECHO PLANO", inc: 0.1, danger: false },
                { desc: "CURVA ACENTUADA (DIR)", inc: 2.1, danger: true },
                { desc: "CURVA ACENTUADA (ESQ)", inc: -1.9, danger: true },
                { desc: "SUBIDA DE SERRA", inc: 0.4, danger: false },
                { desc: "TRECHO IRREGULAR", inc: 0.8, danger: false }
            ]
        };

        let currentEvent = 0;

        // Loop de Atualização de Dados (Mais rápido para jitter realista)
        setInterval(() => {
            const ev = config.events[currentEvent];
            truckState.roll = ev.inc;
            truckState.danger = ev.danger;
            
            // Jitter (Oscilação natural dos sensores)
            const jitter = () => (Math.random() * 0.4 - 0.2);
            let p1_val = config.nominal_psi + jitter() + (ev.inc * -2.5);
            let p2_val = config.nominal_psi + jitter() + (ev.inc * 2.5);
            let inc_val = ev.inc + (jitter() * 0.3);

            // Atualiza Interface
            document.getElementById('psi1').innerText = p1_val.toFixed(1);
            document.getElementById('psi2').innerText = p2_val.toFixed(1);
            document.getElementById('inc').innerText = inc_val.toFixed(1);

            // Barras de Progresso
            document.getElementById('b1').style.width = Math.min(100, (p1_val / 65) * 100) + "%";
            document.getElementById('b2').style.width = Math.min(100, (p2_val / 65) * 100) + "%";
            document.getElementById('b3').style.width = Math.min(100, Math.abs(inc_val) * 35) + "%";

            // Lógica de Cores do Status
            const badge = document.getElementById('main-badge');
            const statusTxt = document.getElementById('status-txt');
            const b4 = document.getElementById('b4');
            
            if(ev.danger) {
                badge.innerText = `● ALERTA: COMPENSAÇÃO ATIVA [${ev.desc}]`;
                badge.classList.add('danger-mode');
                statusTxt.innerText = "AJUSTANDO";
                statusTxt.style.color = "var(--danger)";
                b4.style.background = "var(--danger)";
            } else {
                badge.innerText = `● ESTRADA: ${ev.desc}`;
                badge.classList.remove('danger-mode');
                statusTxt.innerText = "ESTÁVEL";
                statusTxt.style.color = "var(--safe)";
                b4.style.background = "var(--safe)";
            }
        }, 100);

        // Troca de cenário a cada 3 segundos
        setInterval(() => { currentEvent = (currentEvent + 1) % config.events.length; }, 3000);

        drawSimulation();