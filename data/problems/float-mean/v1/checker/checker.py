import sys, json, math
exp=float(open(sys.argv[2]).read().strip());got=float(sys.stdin.read().strip());ok=math.isclose(got,exp,rel_tol=1e-4,abs_tol=1e-4);print(json.dumps({'ok':ok,'message':'' if ok else f'expected≈{exp} got {got}'}))
