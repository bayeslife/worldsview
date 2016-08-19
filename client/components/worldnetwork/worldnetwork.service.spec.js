'use strict';

describe('WorldNetwork Service', function () {

  // load the controller's module
  beforeEach(module('worldsviewApp'));  

  var service;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (WorldNetwork) {
    service = WorldNetwork;    
  }));

  describe('initially', function () {

    it('has no nodes nor links', function () {
      var nodes = service.getNodes();
      expect(nodes.length).toBe(0);

      var links = service.getLinks();
      expect(links.length).toBe(0);
    });
  });

  describe('can have', function () {

    var node= {_id: 'n1'};
    var node2= {_id: 'n2'};
    var link = {sourceId: node._id,targetId: node2._id};

    it('nodes added and deleted', function () {      
      {
        service.addNode(node);
        service.addNode(node2);
        var nodes = service.getNodes();
        expect(nodes.length).toBe(2);
      }
      {
        
        service.delNode(node);
        var nodes = service.getNodes();
        expect(nodes.length).toBe(1);
      }
      {        
        service.delNode(node2);
        var nodes = service.getNodes();
        expect(nodes.length).toBe(0);        
      }
      {
        service.delNode(node);
        var nodes = service.getNodes();
        expect(nodes.length).toBe(0);        
      }
    });

    it('links added and deleted', function () {
      service.addNode(node);
      service.addNode(node2);
      var linkAdded = service.addLink(link);            
      expect(linkAdded).toBe(true);
      var links = service.getLinks();
      expect(links.length).toBe(1);

      service.delLink(link);
      var links = service.getLinks();
      expect(links.length).toBe(0);

    });
  });

});
