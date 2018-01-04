
class Grid{    
    constructor(parent,live_stream, countRow){
        this.parent = parent;
        this._points = [];        
        this.countCells = 17;
        this.countRow = countRow;
        this._live_stream = live_stream;
    }

    set point(cell){
        
        if(cell.attr('select') == undefined){
            this.draw_cell(cell);
        } else{
            cell.css('background','none')
                .removeAttr('select')
        }     

        this._points.push([$(cell).attr('cell'),
                           $(cell).parent().attr('row')]);
    }

    get points(){
        return this._points;
    }

    set countRow(value){
        for (var row = 1; row <= value; row++)
            this.addRow(row)
        this._countRow = value;
    }

    get countCells(){
        return this._countCells;
    }    

    set countCells(value){
        this._countCells = value;
    }

    get countRow(){
        return this._countRow;
    }

    addDiv(parent,class_name,){
        parent.append('<div class="'+class_name+'"></div>');
        return parent.children().last();
    }

    addCell(parent,index){
        var cell = this.addDiv(parent,"cell");
        cell.attr('cell',index)
    }

    addRow(index){
        var row = this.addDiv(this.parent,'row');
        row.attr('row',index);
        for (var i = 1; i <= this.countCells; i++)
            this.addCell(row,i)
    }

    get_json(live_stream){
        var self = this;
        var ajax_data = {
                url: "http://live.crm.gp:5000/json",
                data:JSON.stringify({data:this.points}),
                traditional: true,
                type: "post",
                cache: false,
                timeout: 100000,
                success: function ( data ) {
                    self._points = data.data;
                    if(data.die_live == true){
                        console.log(live_stream);
                       clearInterval(live_stream);
                    }
                    self.clear();
                    self.draw();
                },
                "dataType": "json"
            };
        $.ajax(ajax_data);
    }
    
    clear(){
        var cells = this.parent.find('div[cell]');
        cells.css('background','none')
             .removeAttr('select');

    }    

    draw_cell(cell){
        cell.css('background','url(chip.png)')
            .attr('select','true');
    }
    draw(){
        var self = this;
        this._points.forEach(function(item){
            self.draw_cell(self.parent.children('[row ='+item[1]+']').children('[cell='+item[0]+']'));
        })
    }
}

$(document).ready(function () {
    var live_stream;
    var grid = new Grid($('#wrapper'),live_stream,17);
    $('#wrapper').on('click','.cell',function(){        
                    grid.point = $(this);
                });
    $('.wrapper_send').on('click','#go',function(){
                live_stream = setInterval(function(){                    
                    grid.get_json(live_stream);
                },250);
    });    
    $('.wrapper_send').on('click','#stop',function(){
        clearInterval(live_stream);
    });
});