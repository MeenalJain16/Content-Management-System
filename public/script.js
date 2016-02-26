/* public/script.js */
function show_versions(user_name){
	var proj_name = document.getElementById('directories').value;
	// ./backup_projects/mja034/Demo_projects_backup/
	var path = "./backup_projects/" +  user_name +"/"+ proj_name + "_backup/";
	var str;
	alert("version");
	$.ajax({
				type: "POST",
				url: "/version",	
				data: {path: path, email: user_name},
				cache: false,
				timeout: 15000,
				success: function(data){
					/*for(var i = 0; i< data.length; i++){
						alert(data[i]);
						str = 'fname_'+i;
						alert(str);
						document.getElementById(str).innerHTML = data[i];
					} */
					alert(data);
					window.location("version.ejs");
				}
		});
	
	
}

function getFileName(file, ul_id){
	var file_path = file.getAttribute('href');
	// if user clicks on new, then a textbox is created
	if(file_path.includes("+New")){
		var ul = document.getElementById(ul_id);
		var li = document.createElement("li");
		li.setAttribute("id", "ele"); // added line
		var input = document.createElement('input');
        input.type = "text";
		input.id = "file_css";
		var btn = document.createElement('button');
		btn.onclick  =  function(){
							$(this).closest('li').remove();  return true;
						};
		btn.innerHTML = "x";
		btn.id = "red_btn";
		/*var btn1 = document.createElement('button');
		btn1.innerHTML = "+";
		btn1.id = "green_btn";
		btn1.name = "btn1";
		li.appendChild(btn1); */
		li.appendChild(input);
		li.appendChild(btn); 
		ul.appendChild(li);
		
			$('#file_css').keypress(function(event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13'){
			
				var textbox_value = this.value;
				$.ajax({
					type: "POST",
					url: "/cms_create_file",	
					data: {path: file_path, value: textbox_value},
					cache: false,
					timeout: 15000,
					success: function(data){
						//alert(data);
						reload_div();
					}
				});
			}
			});
		
	} // end of if part
	else{ // if other file is clicked then +NEW
		var path_array = file_path.split('/');
		document.getElementById('current_file').style.display = "";
		document.getElementById('current_file').innerHTML = path_array[3] + '>' + path_array[4];
		document.getElementById('save_btn').style.display = "";
		document.getElementById('version_control').style.display = "";
		document.getElementById('temp').style.display = "none";
		
		$.ajax({
					type: "POST",
					url: "/read_file",	
					data: {path: file_path, file_name: path_array[4], email: path_array[3]},
					cache: false,
					timeout: 15000,
					success: function(data){
						editor.setValue(data);
					}
				});
	}
}
function reload_div(){
	location.reload();
}
function save_file(email){
	var pad = editor.getValue();
	var file_dir = document.getElementById('current_file').innerHTML;
	var file_dir_value = file_dir.split("&gt;");
	var file_path = "./projects/"+email+"/"+file_dir_value[0]+"/"+file_dir_value[1];
		$.ajax({
				type: "POST",
				url: "/save_file",	
				data: {path: file_path, file_content: pad},
				cache: false,
				timeout: 15000,
				success: function(data){
					alert(data);
				}
		});

}
function delete_file(email){
	var file_dir = document.getElementById('current_file').innerHTML;
	var file_dir_value = file_dir.split("&gt;");
	var file_path = "./projects/"+email+"/"+file_dir_value[0]+"/"+file_dir_value[1];
		$.ajax({
				type: "POST",
				url: "/delete_file",	
				data: {path: file_path},
				cache: false,
				timeout: 15000,
				success: function(data){
					alert(data);
					location.reload();
				}
		});

}
function start_revision(email){
	var file_dir = document.getElementById('current_file').innerHTML;
	var file_dir_value = file_dir.split("&gt;");
	var src_path = "./projects/" + email + "/" + file_dir_value[0];
	var dest_path = "./backup_projects/" + email + "/" + file_dir_value[0];
	$.ajax({
				type: "POST",
				url: "/version_control",	
				data: {src_path: src_path, dest_path:dest_path},
				cache: false,
				timeout: 15000,
				success: function(data){
					alert(data);
				}
		});
	alert("Revision Control started. You can check the versions of your project on profile page. Thank you!");

}

window.onload = function() {
	// make the appropriate lists collapsible
	CollapsibleLists.apply();
	
	// make the list with the ID 'newList' collapsible
	//CollapsibleLists.applyTo(document.getElementById('newList'));
	
    var converter = new showdown.Converter();
    var markdownArea = document.getElementById('markdown'); 
	
    var previousMarkdownValue;          

    // convert text area to markdown html
    var convertTextAreaToMarkdown = function(){
        var markdownText = editor.getValue();
        previousMarkdownValue = markdownText;
        html = converter.makeHtml(markdownText);
        markdownArea.innerHTML = html;
    };

    var didChangeOccur = function(){
        if(previousMarkdownValue != editor.getValue()){
            return true;
        }
        return false;
    };

    // check every second if the text area has changed
    setInterval(function(){
        if(didChangeOccur()){
            convertTextAreaToMarkdown();
        }
    }, 1000);

    // convert textarea on input change
    editor.getValue().addEventListener('input', convertTextAreaToMarkdown);

    // ignore if on home page
    if(document.location.pathname.length > 1){
        // implement share js
        var documentName = document.location.pathname.substring(1);
        sharejs.open(documentName, 'text', function(error, doc) {
            doc.attach_textarea(editor.getValue());
            convertTextAreaToMarkdown();
        });        
    }

    // convert on page load
    convertTextAreaToMarkdown();

};