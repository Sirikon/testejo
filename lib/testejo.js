HTMLElement.prototype.Testejo = null;

function Testejo(_element_, _tpath_){
	this._element = null;
	this._content = null;
	this._uploader = null;
	this._templatesPath = null;
	this._templateCache = {};
	this.nSelectedElements = 0;
	this._loading = false;
	this._uploadShown = false;

	this._constructor = function(element, tpath){
		this._element = element;
		this._element.get(0).Testejo = this;
		if(tpath.indexOf(tpath.length-1) == '/'){
			this._templatesPath = tpath;
		}else{
			this._templatesPath = tpath + '/';
		}
		this._element.html(this._render('main'));
		this._content = this._element.find('.tj-content');
		this._uploader = this._element.find('.tj-uploader');
		this.draw();
	}

	this.loadingOn = function(){
		this._element.find('div[tj-loading]').addClass('show');
		this._loading = true;
	}

	this.loadingOff = function(){
		this._element.find('div[tj-loading]').removeClass('show');
		this._loading = false;
	}

	this.showUpload = function(){
		this._content.css('display','none');
		this._uploader.css('display','block');
		this._uploadShown = true;
		this.draw();
	}

	this.hideUpload = function(){
		this._content.css('display','block');
		this._uploader.css('display','none');
		this._uploadShown = false;
		this.draw();
	}

	this._getTemplate = function(name){
		if(this._templateCache[name]){
			return this._templateCache[name];
		}else{
			var req = $.ajax({
				url: this._templatesPath + name + '.hbs',
				async: false
			});
			var hbs = Handlebars.compile(req.responseText);
			this._templateCache[name] = hbs;
			return hbs;
		}
	}

	this._render = function(name, data){
		var hbs = this._getTemplate(name);
		if(Array.isArray(data)){
			var datatoReturn = '';
			for(var i = 0; i<data.length;i++){
				datatoReturn += hbs(data[i]);
			}
			return datatoReturn;
		}
		return hbs(data);
	}

	this._remove = function(elements){
		var anchor = this;
		if(this.remove){
			this.loadingOn();
			this.remove(elements, function(){
				for(var key in elements){
					$("*[tj-file='" + elements[key] + "']").remove();
				}
				anchor.draw();
				anchor.loadingOff();
			});
		}
	}

	this.list = null;

	this.draw = function(){
		this.nSelectedElements  = this._element.find('*[tj-file].selected').length;
		if(this.nSelectedElements != 0 && !this._uploadShown){
			this._element.find("*[role='remove']").removeClass('hidden');
		}else{
			this._element.find("*[role='remove']").addClass('hidden');
		}
		if(this._uploadShown){
			this._element.find("*[role='add']").addClass('hidden');
		}else{
			this._element.find("*[role='add']").removeClass('hidden');
		}
	}

	this.init = function(){
		var anchor = this;
		if(this.list){
			this.list(function(elements){
				var res = anchor._render('file', elements);
				anchor._content.html(res);
			});
		}
	}

	this._constructor(_element_, _tpath_);
}

Testejo.File = function(id,name,thumbnail){
	this.name = name;
	this.id = id;
	this.thumbnail = thumbnail;
}

var Tj = {
	getTestejo: function(element){
		var actualelement = element.parent();
		var found = false;
		while(!found){
			if(actualelement.hasClass('tj-testejo')){
				found = true;
				return actualelement;
			}else{
				actualelement = actualelement.parent();
			}
		}
	}
}

$(document).ready(function(){
	$(document).on('click', '*.tj-file', function(){
		var t = Tj.getTestejo($(this)).get(0).Testejo;
		if(t._loading){ return; }
		$(this).toggleClass('selected');
		var n = $('*.tj-file.selected').length;
		t.nSelectedElements = n;
		t.draw();
	});
	$(document).on('click', "*[role='remove']", function(){
		var t = Tj.getTestejo($(this)).get(0).Testejo;
		if(t._loading){ return; }
		var elementsList = [];
		t._element.find('*[tj-file].selected').each(function(){
			elementsList.push($(this).attr('tj-file'));
		});
		t._remove(elementsList);
	});
	$(document).on('click', "*[role='add']", function(){
		var t = Tj.getTestejo($(this)).get(0).Testejo;
		if(t._loading){ return; }
		t.showUpload();
	});
});