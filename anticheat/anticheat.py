import customtkinter as ctk
import psutil
import hashlib
import os
import subprocess
import json
from datetime import datetime

# Configurações de Cores e Interface
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class AntiCheatScanner(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("DBD Tournament - Integrity Scanner")
        self.geometry("600x500")

        # Variáveis de Verificação
        self.blacklist_procs = ["cheatengine", "injector", "processhacker", "x64dbg", "fiddler"]
        self.game_proc_name = "DeadByDaylight-Win64-Shipping.exe"
        self.logs = []

        # Interface
        self.label = ctk.CTkLabel(self, text="Verificador de Integridade de Campeonato", font=("Roboto", 20))
        self.label.pack(pady=20)

        self.status_box = ctk.CTkTextbox(self, width=500, height=250)
        self.status_box.pack(pady=10)
        self.status_box.insert("0.0", "Aguardando início da varredura...\nCertifique-se de que o jogo está aberto.")

        self.scan_button = ctk.CTkButton(self, text="EXECUTAR VARREDURA ÚNICA", command=self.start_scan)
        self.scan_button.pack(pady=20)

    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.status_box.insert("end", f"[{timestamp}] {message}\n")
        self.logs.append(f"[{timestamp}] {message}")
        self.status_box.see("end")

    def get_dns_cache(self):
        """Verifica se houve conexões com sites de cheats"""
        try:
            # Comando Windows para ver cache de DNS
            result = subprocess.check_output("ipconfig /displaydns", shell=True).decode('latin-1')
            cheats_sites = ["unknowncheats", "guidedhacking", "cheatsdbd"]
            for site in cheats_sites:
                if site in result.lower():
                    self.log(f"[ALERTA] Vestígio de acesso a site suspeito: {site}")
        except:
            self.log("[-] Não foi possível ler o cache de DNS.")

    def scan_modules(self):
        """Varre DLLs injetadas no processo do jogo"""
        found = False
        for proc in psutil.process_iter(['name', 'pid']):
            if proc.info['name'] == self.game_proc_name:
                found = True
                self.log(f"[+] Jogo detectado (PID {proc.info['pid']}). Analisando memória...")
                try:
                    p = psutil.Process(proc.info['pid'])
                    for module in p.memory_maps():
                        path = module.path.lower()
                        # Detecta DLLs fora da pasta padrão do Windows ou do Jogo
                        if "temp" in path or "download" in path or "appdata" in path:
                            self.log(f"[!!!] DLL SUSPEITA DETECTADA: {path}")
                except Exception as e:
                    self.log(f"[-] Erro ao ler módulos: {e}")
        if not found:
            self.log("[!] Aviso: O jogo não está aberto. A análise de memória foi pulada.")

    def start_scan(self):
        self.scan_button.configure(state="disabled", text="ESCANEANDO...")
        self.log("Iniciando varredura poderosa...")

        # 1. Varredura de Processos
        for proc in psutil.process_iter(['name']):
            if any(cheat in proc.info['name'].lower() for cheat in self.blacklist_procs):
                self.log(f"[ALERTA] Processo proibido encontrado: {proc.info['name']}")

        # 2. Varredura de Memória/DLLs
        self.scan_modules()

        # 3. Varredura de DNS
        self.get_dns_cache()

        # 4. Finalização e Gerar Log
        self.save_log()
        self.log("========================================")
        self.log("VARREDURA CONCLUÍDA.")
        self.log("Arquivo 'log_campeonato.txt' gerado.")
        self.log("Envie este arquivo para os administradores.")

    def save_log(self):
        with open("log_campeonato.txt", "w", encoding="utf-8") as f:
            f.write(f"RELATÓRIO DE INTEGRIDADE - DBD TOURNAMENT\n")
            f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            f.write("-" * 40 + "\n")
            for line in self.logs:
                f.write(line + "\n")

if __name__ == "__main__":
    app = AntiCheatScanner()
    app.mainloop()