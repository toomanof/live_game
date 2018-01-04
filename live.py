# -*- coding: utf-8 -*-
#!flask/bin/python
from flask import Flask,Response,jsonify
import json    
from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
from  itertools import product
from  itertools import chain
from pprint import pprint


app = Flask(__name__)


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

def neighbors(point):
    x, y = point
    for xn, yn in product(range(-1, 2), repeat=2):
        if any((xn, yn)) and (x+xn >= 0 and y+yn >= 0):
            yield (x + xn, y + yn)

def advance(board):
    newstate = set()
    recalc = board | set(chain(*map(neighbors, board)))
    for point in recalc:
        count = sum((neigh in board)
                for neigh in neighbors(point))
        if count == 3 or (count == 2 and point in board):
            newstate.add(point)

    return newstate

@app.route('/json', methods = ['POST','GET'])
@crossdomain('*')
def test_my_api():
    dataDict = request.form.to_dict()        
    items_ajax =dataDict.keys()
    p = json.loads(items_ajax[0])
    pprint(p['data'])
    _content = [ list(item) for item in advance(set([(int(item[0]), int(item[1])) for item in p['data']]))]
    return jsonify({'die_live':p['data'] == _content, 'data':_content})