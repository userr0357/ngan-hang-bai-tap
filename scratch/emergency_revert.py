import os

def emergency_revert():
    file_path = r"c:\Users\Admin\Downloads\PTUD\PTUD\public\admin.js"
    
    # Reversal map based on the observed destruction
    reversal_map = {
        '💡💡': '',
        'từừ': 't',
        'cóó': 'c',
        'hệệ': 'h',
        'làà': 'l',
        'mãã': 'm',
        'ngônôn': 'ng',
        'vàà': 'v',
        'đãã': 'đ',
        'shệệow': 'show',
        'stừừ': 'st',
        'vààalààue': 'value',
        'cóóonstừừ': 'const',
        'funcóótừừion': 'function',
        'evààentừừ': 'event',
        'selààecóótừừed': 'selected',
        'disablààed': 'disabled',
        'applààicóóatừừion': 'application',
        'incóólààude': 'include',
        'mããetừừhệệod': 'method',
        'cóóredentừừialààs': 'credentials',
        'JSON.stừừringônônify': 'JSON.stringify',
        'fetừừcóóhệệ': 'fetch',
        'docóóumããentừừ': 'document',
        'getừừElààemããentừừById': 'getElementById',
        'querySelààecóótừừor': 'querySelector',
        'addEvààentừừListừừener': 'addEventListener',
        'DOMContừừentừừLoaded': 'DOMContentLoaded',
        'scóórolààlàà': 'scroll',
        'IntừừoView': 'IntoView',
        'behệệavààior': 'behavior',
        'smããootừừhệệ': 'smooth',
        'stừừartừừ': 'start',
        'setừừTimããeoutừừ': 'setTimeout',
        'urlààParamããs': 'urlParams',
        'urlàà': 'url',
        'secóótừừion': 'section',
        'dashệệboard': 'dashboard',
        'lààecóótừừurer': 'lecturer',
        'datừừa': 'data',
        'gvàà': 'gv',
        'PerPage': 'PerPage',
        'Initừừialààize': 'Initialize',
        'switừừcóóhệệ': 'switch',
        'mããenu': 'menu',
        'itừừemãã': 'item',
        'acóótừừivààe': 'active',
        'admããin': 'admin',
        'lààoad': 'load',
        'Initừừ': 'Init',
        'Exercóóises': 'Exercises',
        'hệệistừừory': 'history',
        'Acóótừừivààitừừy': 'Activity',
        'stừừudentừừs': 'students',
        'exportừừ': 'export',
        'navààigatừừeTo': 'navigateTo',
        'alààias': 'alias',
        'id': 'id',
        'svàà': 'sv',
        'searcóóhệệ': 'search',
        'filààtừừer': 'filter',
        'cóólààass': 'class',
        'lààớp': 'lớp',
        'focóóus': 'focus',
        'cóóentừừer': 'center',
        'facóóulààtừừy': 'faculty',
        'khệệoa': 'khoa',
        'shệệowToastừừ': 'showToast',
        'submããitừừtừừed': 'submitted',
        'nộp': 'nộp',
        'flààag': 'flag',
        'từừablààe': 'table',
        'wrapper': 'wrapper',
        'từừên': 'tên',
    }

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sort keys by length descending to avoid partial matches
    for bad in sorted(reversal_map.keys(), key=len, reverse=True):
        content = content.replace(bad, reversal_map[bad])

    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    
    print(f"Emergency revert applied to {file_path}")

if __name__ == "__main__":
    emergency_revert()
