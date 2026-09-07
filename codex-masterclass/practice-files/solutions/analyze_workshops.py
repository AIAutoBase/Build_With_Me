"""Reproduce Lesson 5 calculations with the standard library. Synthetic data only."""
import csv,json,sys,pathlib
from decimal import Decimal
def summarize(rows):
    confirmed=[r for r in rows if r['registration_status']=='confirmed']
    attendees=[r for r in rows if int(r['attended'])==1]
    scores=[Decimal(r['satisfaction_score']) for r in attendees if r['satisfaction_score'].strip()]
    gross=sum((Decimal(r['ticket_price_usd']) for r in rows),Decimal(0))
    refund=sum((Decimal(r['refund_usd']) for r in rows),Decimal(0))
    return {'registrations':len(rows),'confirmed':len(confirmed),'cancelled':len(rows)-len(confirmed),'attended':len(attendees),'attendance_rate':len(attendees)/len(confirmed) if confirmed else None,'collected_usd':str(gross),'refunds_usd':str(refund),'net_collections_usd':str(gross-refund),'observed_scores':len(scores),'score_sum':str(sum(scores)),'mean_score':str(sum(scores)/len(scores)) if scores else None,'score_coverage':len(scores)/len(attendees) if attendees else None}
def analyze(path):
    with open(path,newline='',encoding='utf-8-sig') as f:rows=list(csv.DictReader(f))
    seen=set()
    for r in rows:
        ident=r['registration_id'].strip()
        if not ident or ident in seen:raise ValueError('Missing or duplicate registration ID')
        seen.add(ident)
        if r['data_type']!='synthetic':raise ValueError('Expected synthetic classroom data')
        if r['registration_status'] not in ('confirmed','cancelled'):raise ValueError('Unexpected registration status')
        if r['attended'] not in ('0','1'):raise ValueError('Attendance must be 0 or 1')
        if r['registration_status']=='cancelled' and r['attended']=='1':raise ValueError('Cancelled attendee requires review')
        price,refund=Decimal(r['ticket_price_usd']),Decimal(r['refund_usd'])
        if not 0<=refund<=price:raise ValueError('Invalid payment/refund amounts')
        score=r['satisfaction_score'].strip()
        if score and not 1<=Decimal(score)<=5:raise ValueError('Score outside 1 to 5')
    return {'synthetic':True,'overall':summarize(rows),'by_workshop':{w:summarize([r for r in rows if r['workshop_id']==w]) for w in sorted({r['workshop_id'] for r in rows})}}
if __name__=='__main__':
    result=analyze(sys.argv[1]);print(json.dumps(result,indent=2))
    if len(sys.argv)>2:
        out=pathlib.Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
        with out.open('w',newline='',encoding='utf-8') as f:
            writer=csv.DictWriter(f,fieldnames=['workshop_id',*result['overall'].keys()]);writer.writeheader()
            for ident,values in result['by_workshop'].items():writer.writerow({'workshop_id':ident,**values})
