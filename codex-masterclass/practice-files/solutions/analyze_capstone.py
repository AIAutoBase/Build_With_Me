"""Validate and analyze the synthetic lesson 10 data; Python standard library."""
import csv,json,sys
def analyze(path):
    seen=set();capacity=confirmed=attended=0;count=0
    with open(path,newline='',encoding='utf-8-sig') as stream:
        for line,row in enumerate(csv.DictReader(stream),2):
            ident=row['workshop_id'].strip()
            if not ident or ident in seen:raise ValueError(f'Line {line}: missing or duplicate identifier')
            seen.add(ident)
            values=[]
            for key in ('capacity','confirmed_seats','attended'):
                raw=row[key].strip()
                if not raw.isdecimal():raise ValueError(f'Line {line}: invalid whole number in {key}')
                values.append(int(raw))
            c,f,a=values
            if not c>0 or not 0<=a<=f<=c:raise ValueError(f'Line {line}: counts violate capacity constraints')
            capacity+=c;confirmed+=f;attended+=a;count+=1
    return {'synthetic':True,'rows':count,'capacity':capacity,'confirmed_seats':confirmed,'attended':attended,'attendance_rate':attended/confirmed if confirmed else None,'confirmation_occupancy':confirmed/capacity if capacity else None}
if __name__=='__main__':print(json.dumps(analyze(sys.argv[1]),indent=2))
