// function_tree.js
class node 
{ // CONSTRUCTOR
  constructor()
  { this.value = null;
    this.parent = null;
    this.first_child = null;
    this.next_neighbor = null;
    this.prev_neighbor = null;
  }

  create_first_child(first_child_value)
  { let new_first_child = new node();
    new_first_child.parent = this;
    new_first_child.value = first_child_value;
    this.first_child = new_first_child;
  }
  
  create_next_neighbor(next_neighbor_value)
  { let new_next_neighbor = new node();
    new_next_neighbor.prev_neighbor = this;
    new_next_neighbor.value = next_neighbor_value;
    this.next_neighbor = new_next_neighbor;
  }
} // end of node class definition

class function_tree
{ // CONSTRUCTOR
  constructor(operator)
  { // the root node is always constructed with the value of the root operator.
    this.root_node = new node(); 
    this.root_node.value = operator; // root_node should never again be altered in the code.
    this.current_node = root_node;
  }

  move_to_first_child()
  { if (this.current_node.first_child)
    { this.current_node = this.current_node.first_child;
    }
  }
  
  move_to_next_neighbor()
  { if (this.current_node.next_neighbor)
    { this.current_node = this.current_node.next_neighbor;
    }
  }

  move_to_parent()
  { if (this.current_node.parent)
    { this.current_node = this.current_node.parent;
    }
  }

  move_to_prev_neighbor()
  { if (this.current_node.prev_neighbor)
    { this.current_node = this.current_node.prev_neighbor;
    }
  }
  

  // calling this method resets the position of the current node to the root position.
  // thus, this method should only be called when there is no need to record additional
  // information into the calling object. in other words, use this function only when
  // pushing the finished outer class object to some new place, after which outer class 
  // object should be reset using its default constructor.
  // **returns**: function_tree object
  create_deep_copy()
  { const new_tree = new function_tree(this.root_node.value)
    this.current_node = this.root_node;
    // root node has no first child? return the single node as the new tree.
    if (!this.root_node.first_child)
    { return new_tree;
    }
    // handle first child of root node
    else
    { // create new first child node for the root of the new tree.
      new_tree.root_node.create_first_child(this.root_node.first_child.value);
      // move new_tree's current node (root) to the newly assigned first child position.
      new_tree.move_to_first_child();
      // move the class's current node equivalently.
      this.move_to_first_child();
    }
    let count = 0;
    // the algorithm below will always return the current node to root. 
    while (this.current_node !== this.root_node)
    { // always barrel down as far as possible before looking for neighbors.
      while (this.current_node.first_child)
      { // create new first child node for new tree.
        new_tree.current_node.create_first_child(this.current_node.first_child.value);
        new_tree.move_to_first_child();
        this.move_to_first_child();
      } 
      // once you are at the bottom, can you find a next neighbor?
      if (this.current_node.next_neighbor)
      { // create next neighbor node for new tree.
        new_tree.current_node.create_next_neighbor(this.current_node.next_neighbor.value);
        new_tree.move_to_next_neighbor();
        this.move_to_next_neighbor();
      }
      // otherwise,
      else 
      { // go up the parents until there is a new neighbor or you return to root.
        while (this.current_node.parent !== null && this.current_node.next_neighbor === null)
        { this.move_to_parent();
          new_tree.move_to_parent();
        }
        // made it back to root? return the new tree.
        if (this.current_node === this.root_node)
        { return new_tree;
        }
        // found a next neighbor? copy and move to it.
        else if (this.current_node.next_neighbor !== null)
        { new_tree.current_node.create_next_neighbor(this.current_node.next_neighbor.value);
          new_tree.move_to_next_neighbor();
          this.move_to_next_neighbor();
        }
      }
    } // end of tree loop
  } // end of create_deep_copy()
}
