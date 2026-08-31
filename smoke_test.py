import paramiko
import json
import time

def run_smoke_tests():
    hostname = '169.58.248.190'
    port = 22
    username = 'root'
    password = '32957'

    print("Connexion au VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(hostname, port, username, password, timeout=10)
        
        commands = [
            ("Verifier l'etat reel", "cd /opt/nkyel && docker compose ps"),
            ("Verifier les erreurs au demarrage", "docker logs --tail=50 nkyel-api"),
            ("Voir les ports reellement exposes", "docker inspect nkyel-api --format='{{json .NetworkSettings.Ports}}'"),
            ("Verifier les variables presentes (securise)", "docker exec nkyel-api sh -lc 'env | cut -d= -f1 | sort'"),
            ("Lancer les tests de la beta/concurrence", "docker exec nkyel-api pytest -q backend/tests/test_beta_concurrency.py || docker exec nkyel-api python backend/tests/test_beta_concurrency.py"),
            ("Healthcheck 8000", "curl -s -i http://127.0.0.1:8000/health || echo 'Failed'"),
            ("Healthcheck 8080", "curl -s -i http://127.0.0.1:8080/health || echo 'Failed'")
        ]
        
        for name, cmd in commands:
            print(f"\n==============================================")
            print(f"-> {name}")
            print(f"==============================================")
            stdin, stdout, stderr = client.exec_command(cmd)
            
            out = stdout.read().decode('utf-8').strip()
            err = stderr.read().decode('utf-8').strip()
            
            if out:
                print(out)
            if err:
                print(f"[STDERR] {err}")
                
    except Exception as e:
        print(f"Erreur de connexion SSH : {e}")
    finally:
        client.close()
        print("\nTermine.")

if __name__ == '__main__':
    run_smoke_tests()
