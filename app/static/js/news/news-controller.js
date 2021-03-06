'use strict';

angular.module('news')
  .controller('NewsController', ['$scope',  '$modal', 'resolvedNews', 'News', 'SimpleNews', 'DTOptionsBuilder', 'DTColumnDefBuilder',
    function($scope, $modal, resolvedNews, News, SimpleNews, DTOptionsBuilder, DTColumnDefBuilder) {

      
      $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withOption('order',[3,'desc']);

      $scope.dtColumnDefs = [
          DTColumnDefBuilder.newColumnDef(0),
          DTColumnDefBuilder.newColumnDef(1),
          DTColumnDefBuilder.newColumnDef(2).notSortable(),
          DTColumnDefBuilder.newColumnDef(3),
          DTColumnDefBuilder.newColumnDef(4),
          DTColumnDefBuilder.newColumnDef(5)
      ];

      $scope.newses = resolvedNews;
      
      $scope.editorOptions = {
        language: 'ru',
        uiColor: '#000000',
        enterMode: CKEDITOR.ENTER_BR,
        shiftEnterMode: CKEDITOR.ENTER_BR,
        pasteFromWordRemoveStyles: true,
        filebrowserImageUploadUrl: "private/pic/picUpload",
        removePlugins: 'save',
        toolbarGroups: [{
            name: 'clipboard',
            groups: ['clipboard', 'undo']
          }, {
            name: 'editing',
            groups: ['find', 'selection', 'spellchecker']
          }, {
            name: 'links'
          }, {
            name: 'insert'
          }, {
            name: 'forms'
          }, {
            name: 'tools'
          }, {
            name: 'document',
            groups: ['mode', 'document', 'doctools']
          }, {
            name: 'others'
          },
          '/', {
            name: 'basicstyles',
            groups: ['basicstyles', 'cleanup']
          }, {
            name: 'paragraph',
            groups: ['list', 'indent', 'blocks', 'align', 'bidi']
          }, {
            name: 'styles'
          }, {
            name: 'colors'
          }, {
            name: 'about'
          }
        ]
      };


      $scope.create = function() {
        $scope.clear();
        $scope.open(undefined, true);
      };

      $scope.update = function(id) {
        $scope.news = News.get({
          id: id
        });
        $scope.open(id, false);
      };

      $scope.delete = function(id) {
        News.delete({
            id: id
          },
          function() {
            $scope.newses = SimpleNews.query();
          });
      };

      $scope.save = function(id) {
        if (id) {
          News.update({
              id: id
            }, $scope.news,
            function() {
              $scope.newses = SimpleNews.query();
              $scope.clear();
            });
        } else {
          News.save($scope.news,
            function() {
              $scope.newses = SimpleNews.query();
              $scope.clear();
            });
        }
      };

      $scope.clear = function() {
        $scope.news = {

          "title": "",

          "content": "",

          "create_time": "",

          "update_time": "",

          "author": "",

          "view_count": "",

          "temp_image":"",

          "company" :"",

          "icon":"",

          "is_draft": false,

          "video_link": "",

          "id": ""
        };
      };

      $scope.open = function(id, is_create) {
        var template = "views/news/";
        if (is_create) {
          template = template + "news-add.html";
        } else {
          template = template + "news-update.html";
        }
        var newsSave = $modal.open({
          templateUrl: template,
          controller: NewsSaveController,
          resolve: {
            news: function() {
              return $scope.news;
            }
          }
        });

        newsSave.result.then(function(entity) {
          $scope.news = entity;
          $scope.save(id);
        });
      };
    }
  ]);



var NewsSaveController =
  function($scope, $modalInstance, news, $upload) {
    $scope.news = news;
    $scope.languages = [
      {
        name:'中文',
        value:'zh'
      },
      {
        name:'英文',
        value:'en'
      },
      {
        name:'中英文',
        value:'zhen'
      }
    ];
    $scope.select = {
      language : null
    };
    if($scope.news.news_language == null || $scope.news.news_language == undefined){
      $scope.select.language = $scope.languages[0];
    }else{
      for (var i = 0; i < $scope.languages.length; i++) {
        var entity = $scope.languages[i];
        if(entity.value == $scope.news.news_language){
          $scope.select.language = entity;
          break;
        }
      };
    }
    $scope.video_percent = '';
    $scope.uploadFile = function(fx,event) {
      var file = fx[0];
      $upload.upload({
        url: 'news/upload_image',
        file: file
      }).progress(function(evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        $scope.video_percent = progressPercentage + '%';
      }).success(function(data, status, headers, config) {
        //console.log('success');
        alert('上传成功！');
        $scope.news.video_link = data.path;
        $scope.video_percent = '';
      }).fail(function(e){
        alert('上传失败！');
        $scope.video_percent = '';
      });
    };

    $scope.uploadImage = function(key,fx,event) {
      var file = fx[0];
      $upload.upload({
        url: 'news/upload_image',
        file: file
      }).progress(function(evt) {

      }).success(function(data, status, headers, config) {
        console.log('success');
        alert('上传成功！');
        if(key == 'content'){
           $scope.news.content = $scope.news.content + getImageHTML(data.path);
        }else{
           $scope.news.icon = data.path;
           $scope.news.temp_image = data.filename;
        }
       
      });
    };


    function getImageHTML(path){
      return '<img src="'+path +'" width="100%"></img>';
    }

    $scope.create_timeDateOptions = {
      dateFormat: 'yy-mm-dd',
    };
    $scope.update_timeDateOptions = {
      dateFormat: 'yy-mm-dd',
    };

    $scope.ok = function() {
      $scope.news['news_language'] = $scope.select.language.value;
      $modalInstance.close($scope.news);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };